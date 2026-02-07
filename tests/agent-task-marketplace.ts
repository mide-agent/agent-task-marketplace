import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { AgentTaskMarketplace } from '../target/types/agent_task_marketplace';
import { expect } from 'chai';

describe('agent-task-marketplace', () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AgentTaskMarketplace as Program<AgentTaskMarketplace>;
  
  const client = anchor.web3.Keypair.generate();
  const freelancer = anchor.web3.Keypair.generate();
  
  let taskPda: anchor.web3.PublicKey;
  let bidPda: anchor.web3.PublicKey;
  let escrowPda: anchor.web3.PublicKey;

  before(async () => {
    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(client.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(freelancer.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
  });

  it('Initializes the program', async () => {
    // Program initialization test
    expect(program.programId).to.not.be.null;
  });

  it('Posts a task', async () => {
    const title = "Build a Discord Bot";
    const description = "Create a bot that monitors server activity";
    const budget = new anchor.BN(1000 * 10**6); // 1000 USDC
    const milestones = [
      { description: "Design doc", amount: new anchor.BN(200 * 10**6), completed: false, paid: false },
      { description: "MVP", amount: new anchor.BN(500 * 10**6), completed: false, paid: false },
      { description: "Final delivery", amount: new anchor.BN(300 * 10**6), completed: false, paid: false },
    ];
    const deadline = new anchor.BN(Date.now() / 1000 + 7 * 24 * 60 * 60);

    [taskPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("task"), client.publicKey.toBuffer(), Buffer.from(title)],
      program.programId
    );

    await program.methods
      .postTask(title, description, budget, milestones, deadline)
      .accounts({
        owner: client.publicKey,
        task: taskPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([client])
      .rpc();

    const task = await program.account.task.fetch(taskPda);
    expect(task.title).to.equal(title);
    expect(task.budget.toNumber()).to.equal(budget.toNumber());
  });

  it('Submits a bid', async () => {
    const amount = new anchor.BN(900 * 10**6);
    const timeline = new anchor.BN(5 * 24 * 60 * 60); // 5 days
    const proposal = "I can build this with Node.js and Discord.js";

    [bidPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("bid"), taskPda.toBuffer(), freelancer.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .submitBid(amount, timeline, proposal)
      .accounts({
        bidder: freelancer.publicKey,
        task: taskPda,
        bid: bidPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([freelancer])
      .rpc();

    const bid = await program.account.bid.fetch(bidPda);
    expect(bid.amount.toNumber()).to.equal(amount.toNumber());
    expect(bid.status).to.deep.equal({ pending: {} });
  });

  it('Accepts a bid', async () => {
    await program.methods
      .acceptBid()
      .accounts({
        owner: client.publicKey,
        task: taskPda,
        bid: bidPda,
      })
      .signers([client])
      .rpc();

    const task = await program.account.task.fetch(taskPda);
    expect(task.status).to.deep.equal({ inProgress: {} });
    expect(task.acceptedBid.toBase58()).to.equal(bidPda.toBase58());
  });

  // Add more tests for escrow, payments, reviews...
});
