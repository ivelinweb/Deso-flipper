import { ethers, getChainId, network } from "hardhat"
import {
	developmentChains,
	VOTING_DELAY,
	proposalsFile,
	FUNC,
	PROPOSAL_DESCRIPTION,
	NEW_STORE_VALUE,
} from "../helper-hardhat-config"
import * as fs from "fs"
import { moveBlocks } from "../utils/move-blocks"

export async function propose(args: any[], functionToCall: string, proposalDescription: string) {
	const governor = await ethers.getContract("GovernorContract")

	const box = await ethers.getContract("Box")

	const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)

	console.log(`Proposing ${functionToCall} on ${box.address} with ${args}`)
	console.log(`Proposal Description:\n  ${proposalDescription}`)



	const proposeTx = await governor.createProposal(
		[box.address],
		[0],
		[encodedFunctionCall],
		"Title",
		"pull request url",
		"Proposal Description"
	)
	// If working on a development chain, we will push forward till we get to the voting period.
	if (developmentChains.includes(network.name)) {
		await moveBlocks(VOTING_DELAY + 1)
	}
	const proposeReceipt = await proposeTx.wait(1)
	const proposalId = proposeReceipt.events[0].args.proposalId
	console.log(`Proposed with proposal ID:\n  ${proposalId}`)

	const proposalState = await governor.state(proposalId)
	const proposalSnapShot = await governor.proposalSnapshot(proposalId)
	const proposalDeadline = await governor.proposalDeadline(proposalId)
	// save the proposalId
	storeProposalId(proposalId);

	// the Proposal State is an enum data type, defined in the IGovernor contract.
	// 0:Pending, 1:Active, 2:Canceled, 3:Defeated, 4:Succeeded, 5:Queued, 6:Expired, 7:Executed
	console.log(`Current Proposal State: ${proposalState}`)
	// What block # the proposal was snapshot
	console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
	// The block number the proposal voting expires
	console.log(`Current Proposal Deadline: ${proposalDeadline}`)
}

async function storeProposalId(proposalId: any) {
	const chainId = await getChainId(); // network.config.chainId!.toString();
	console.log(chainId)

	let proposals: any = {};

	proposals[chainId] = [];
	proposals[chainId].push(proposalId.toString());

	if (!fs.existsSync(proposalsFile)) {
		fs.writeFileSync(proposalsFile, JSON.stringify(proposals), "utf8");
		return;
	}

	fs.writeFileSync(proposalsFile, JSON.stringify(proposals), "utf8");
}

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
