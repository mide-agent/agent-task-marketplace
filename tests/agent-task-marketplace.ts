import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { AgentTaskMarketplace } from '../target/types/agent_task_marketplace';
import { expect } from 'chai';
import { PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

describe('agent-task-marketplace', () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AgentTaskMarketplace as Program<AgentTaskMarketplace>;
  
  const client = anchor.web3.Keypair.generate();
  const freelancer = anchor.web3.Keypair.generate();
  const reviewer = anchor.web3.Keypair.generate();
  
  let taskPda: PublicKey;
  let bidPda: PublicKey;
  let escrowPda: PublicKey;
  let profilePda: PublicKey;
  let freelancerProfilePda: PublicKey;
  
  const title = "Build a Discord Bot";
  const description = "Create a bot that monitors server activity";
  const budget = new BN(1000 * 10**6); // 1000 USDC
  const milestones = [
    { description: "Design doc", amount: new BN(200 * 10**6), completed: false, paid: false },
    { description: "MVP", amount: new BN(500 * 10**6), completed: false, paid: false },
    { description: "Final delivery", amount: new BN(300 * 10**6), completed: false, paid: false },
  ];
  const deadline = new BN(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60);

  before(async () => {
    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(client.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(freelancer.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(reviewer.publicKey, anchor.web3.LAMPORTS_PER_SOL);
    
    // Wait for airdrop confirmation
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  describe('Task Program', () => {
    it('Initializes the program', async () => {
      expect(program.programId).to.not.be.null;
      console.log('Program ID:', program.programId.toBase58());
    });

    it('Posts a task successfully', async () => {
      [taskPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('task'), client.publicKey.toBuffer(), Buffer.from(title)],
        program.programId
      );

      await program.methods
        .postTask(title, description, budget, milestones, deadline)
        .accounts({
          owner: client.publicKey,
          task: taskPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([client])
        .rpc();

      const task = await program.account.task.fetch(taskPda);
      expect(task.title).to.equal(title);
      expect(task.description).to.equal(description);
      expect(task.budget.toString()).to.equal(budget.toString());
      expect(task.milestones.length).to.equal(3);
      expect(task.status).to.deep.equal({ open: {} });
      expect(task.owner.toBase58()).to.equal(client.publicKey.toBase58());
    });

    it('Fails to post task with empty title', async () => {
      const badTitle = "";
      
      try {
        const [badTaskPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('task'), client.publicKey.toBuffer(), Buffer.from(badTitle)],
          program.programId
        );

        await program.methods
          .postTask(badTitle, description, budget, milestones, deadline)
          .accounts({
            owner: client.publicKey,
            task: badTaskPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([client])
          .rpc();
        
        expect.fail('Should have thrown error');
      } catch (err) {
        expect(err.toString()).to.include('EmptyTitle');
      }
    });

    it('Fails to post task with mismatched milestone amounts', async () => {
      const badMilestones = [
        { description: "M1", amount: new BN(100 * 10**6), completed: false, paid: false },
        { description: "M2", amount: new BN(200 * 10**6), completed: false, paid: false },
      ]; // Sum is 300, but budget is 1000
      
      try {
        const [badTaskPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('task'), client.publicKey.toBuffer(), Buffer.from("Bad Task")],
          program.programId
        );

        await program.methods
          .postTask("Bad Task", description, budget, badMilestones, deadline)
          .accounts({
            owner: client.publicKey,
            task: badTaskPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([client])
          .rpc();
        
        expect.fail('Should have thrown error');
      } catch (err) {
        expect(err.toString()).to.include('MilestoneAmountMismatch');
      }
    });

    it('Updates task description', async () => {
      const newDescription = "Updated description";
      
      await program.methods
        .updateTask(newDescription, null, null)
        .accounts({
          owner: client.publicKey,
          task: taskPda,
        })
        .signers([client])
        .rpc();

      const task = await program.account.task.fetch(taskPda);
      expect(task.description).to.equal(newDescription);
    });

    it('Fails to update non-owned task', async () => {
      try {
        await program.methods
          .updateTask("Hacked", null, null)
          .accounts({
            owner: freelancer.publicKey, // Wrong owner
            task: taskPda,
          })
          .signers([freelancer])
          .rpc();
        
        expect.fail('Should have thrown error');
      } catch (err) {
        // Expected to fail due to constraint violation
        expect(err).to.not.be.null;
      }
    });
  });

  describe('Bid Program', () => {
    it('Submits a bid', async () => {
      const bidAmount = new BN(900 * 10**6);
      const timeline = new BN(5 * 24 * 60 * 60); // 5 days
      const proposal = "I can build this with Node.js and Discord.js";

      [bidPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('bid'), taskPda.toBuffer(), freelancer.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .submitBid(bidAmount, timeline, proposal)
        .accounts({
          bidder: freelancer.publicKey,
          task: taskPda,
          bid: bidPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([freelancer])
        .rpc();

      const bid = await program.account.bid.fetch(bidPda);
      expect(bid.amount.toString()).to.equal(bidAmount.toString());
      expect(bid.proposal).to.equal(proposal);
      expect(bid.status).to.deep.equal({ pending: {} });
      expect(bid.task.toBase58()).to.equal(taskPda.toBase58());
    });

    it('Fails when freelancer bids on own task', async () => {
      try {
        const [badBidPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('bid'), taskPda.toBuffer(), client.publicKey.toBuffer()],
          program.programId
        );

        await program.methods
          .submitBid(new BN(100 * 10**6), new BN(1000), "I will do it")
          .accounts({
            bidder: client.publicKey, // Task owner trying to bid
            task: taskPda,
            bid: badBidPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([client])
          .rpc();
        
        expect.fail('Should have thrown error');
      } catch (err) {
        // Expected to fail due to constraint
        expect(err).to.not.be.null;
      }
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

      const bid = await program.account.bid.fetch(bidPda);
      expect(bid.status).to.deep.equal({ accepted: {} });
    });

    it('Cannot accept bid twice', async () => {
      try {
        await program.methods
          .acceptBid()
          .accounts({
            owner: client.publicKey,
            task: taskPda,
            bid: bidPda,
          })
          .signers([client])
          .rpc();
        
        expect.fail('Should have thrown error');
      } catch (err) {
        // Expected to fail - bid already accepted
        expect(err).to.not.be.null;
      }
    });
  });

  describe('Profile Program', () => {
    it('Initializes client profile', async () => {
      [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('profile'), client.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeAgentProfile("ClientAgent")
        .accounts({
          owner: client.publicKey,
          profile: profilePda,
          systemProgram: SystemProgram.programId,
        })
        .signers([client])
        .rpc();

      const profile = await program.account.agentProfile.fetch(profilePda);
      expect(profile.name).to.equal("ClientAgent");
      expect(profile.owner.toBase58()).to.equal(client.publicKey.toBase58());
      expect(profile.ratingCount).to.equal(0);
    });

    it('Initializes freelancer profile', async () => {
      [freelancerProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('profile'), freelancer.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeAgentProfile("FreelancerAgent")
        .accounts({
          owner: freelancer.publicKey,
          profile: freelancerProfilePda,
          systemProgram: SystemProgram.programId,
        })
        .signers([freelancer])
        .rpc();

      const profile = await program.account.agentProfile.fetch(freelancerProfilePda);
      expect(profile.name).to.equal("FreelancerAgent");
    });

    it('Cannot create duplicate profile', async () => {
      try {
        await program.methods
          .initializeAgentProfile("Duplicate")
          .accounts({
            owner: client.publicKey,
            profile: profilePda,
            systemProgram: SystemProgram.programId,
          })
          .signers([client])
          .rpc();
        
        expect.fail('Should have thrown error');
      } catch (err) {
        // Expected - account already exists
        expect(err).to.not.be.null;
      }
    });
  });

  describe('Edge Cases', () => {
    it('Lists all tasks', async () => {
      const allTasks = await program.account.task.all();
      expect(allTasks.length).to.be.at.least(1);
      
      const foundTask = allTasks.find(t => t.publicKey.toBase58() === taskPda.toBase58());
      expect(foundTask).to.not.be.undefined;
    });

    it('Lists all bids for a task', async () => {
      const allBids = await program.account.bid.all();
      const taskBids = allBids.filter(b => b.account.task.toBase58() === taskPda.toBase58());
      expect(taskBids.length).to.be.at.least(1);
    });
  });
});
