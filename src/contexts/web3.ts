import { configureChains, createConfig, connect, disconnect, InjectedConnector, readContract, writeContract, waitForTransaction, multicall, prepareWriteContract, type WalletClient } from "@wagmi/core";
import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc";
import { parseAbiItem, parseEther, type PublicClient, type FallbackTransport, formatUnits } from "viem";
import { readable, writable } from "svelte/store";
import { mantleTestnet } from "viem/chains";
import { cachedStore, consistentStore } from "../helpers/reactivity-helpers";
import { bytesToPixels } from "../../contracts/scripts/libraries/pixel-parser"
import { PIXEL_PRICE } from "../values";

import { pxlsCoreABI, magicPlatesABI } from "../../contracts/generated";

type Delay = { idx: number, delay: number }
export type Plate = { pixels: number[][], delays: Delay[] }
export type P2PTrade = { id: `0x${string}`, seller: string, buyer: string, pixels: number[][], price: bigint }

export function createWeb3Ctx() {
	const PXLS = import.meta.env.VITE_PXLS
	const PLTS = import.meta.env.VITE_PLTS
	const USDC = import.meta.env.VITE_USDC

	let publicClient: PublicClient<FallbackTransport>
	let walletClient: WalletClient

	const ctx = {
		account: cachedStore(writable<`0x${string}` | null>()),

		async connect() {
			const { chains, publicClient: publicClientGetter } = configureChains(
				[mantleTestnet],
				[jsonRpcProvider({ rpc: (_) => ({ http: import.meta.env.VITE_RPC_URL }), })],
			)

			const { publicClient: pc, connectors } = createConfig({
				autoConnect: true,
				connectors: [new InjectedConnector({ chains })],
				publicClient: publicClientGetter
			})
			publicClient = pc

			walletClient = await connectors[0]!.getWalletClient()

			const { account } = await connect({ connector: connectors[0]! });
			console.log(account)
			ctx.account.set(account)
		},

		async disconnect() {
			await disconnect()
			ctx.account.set(null)
		},

		usdPrice: consistentStore(readable<number>(0.378, (set) => {
			readContract({
				address: USDC,
				abi: [parseAbiItem("function getPrice(bytes32 id) public view returns((int64, uint64, int32, uint))")],
				functionName: "getPrice",
				args: [import.meta.env.VITE_MNT_UDC_ID]
			}).then(r => {
				const mntUsdPrice = Number(r[0]) * Math.pow(10, -8)
				set(mntUsdPrice);
			});
		})),

		pixels: consistentStore(writable<number[][]>([], (set) => {
			ctx.account.subscribe(async acc => {
				if (!acc) {
					set([])
					return
				}

				const pixels = (await readContract({
					address: PXLS,
					abi: [parseAbiItem("function pixelsOf(address addr) external view returns (uint8[][] memory)")],
					functionName: "pixelsOf",
					args: [acc],
				})) as number[][];

				set(pixels)
			})
		})),

		plates: consistentStore(writable<Plate[]>([], (set) => {
			ctx.account.subscribe(async acc => {
				if (!acc) {
					set([])
					return
				}

				const plates = (await readContract({
					address: PLTS,
					abi: magicPlatesABI,
					functionName: "platesOf",
					args: [acc],
				})).map(p => ({ pixels: p.pixels.map(pxl => pxl.map(i => i)), delays: p.delays.map(d => ({ idx: Number(d.idx), delay: d.delay })) }));

				set(plates)
			})
		})),

		trades: consistentStore(writable<P2PTrade[]>([], set => {
			ctx.account.subscribe(async acc => {
				if (!acc) {
					set([])
					return
				}

				// TODO: 

				set([])
			})
		})),

		async getTrade(id: `0x${string}`) {
			const trade = await readContract({
				address: PXLS,
				abi: [parseAbiItem("function getTrade(bytes32 id) view returns((address, address, uint8[][], uint256))")],
				functionName: "getTrade",
				args: [id]
			});
			return trade[2].length ? {
				id,
				seller: trade[0],
				buyer: trade[1],
				pixels: trade[2].map(p => p.map(pi => pi)),
				price: trade[3]
			} as P2PTrade : null
		},

		async openTrade(pixels: number[][], price: bigint, receiver: string, isSell: boolean) {
			const { hash } = await writeContract({
				address: PXLS,
				abi: [parseAbiItem("function openTrade(address, uint8[][], uint256, bool) external payable")],
				functionName: "openTrade",
				args: [receiver as `0x${string}`, pixels, price, isSell],
				value: price
			});

			const { status, blockNumber } = await waitForTransaction({ hash })
			if (status == "reverted") throw "reverted"

			const logs = await publicClient.getLogs({
				address: PXLS,
				event: parseAbiItem('event TradeOpened(address indexed creator, bytes32 id)'),
				args: {
					creator: ctx.account.current
				},
				fromBlock: blockNumber,
				toBlock: blockNumber
			})

			const tradeId = logs[0]!.args.id!

			ctx.trades.update(curr => {
				curr.push({
					id: tradeId,
					seller: isSell ? ctx.account.current! : receiver,
					buyer: isSell ? receiver : ctx.account.current!,
					pixels,
					price
				})
				return curr
			})

			return tradeId
		},

		async closeTrade(trade: P2PTrade) {
			// const ptx = await prepareWriteContract({
			// 	address: PXLS,
			// 	abi: [parseAbiItem("function closeTrade(bytes32 id) external payable")],
			// 	functionName: "closeTrade",
			// 	args: [trade.id],
			// 	value: trade.price
			// })

			const { hash } = await writeContract({
				address: PXLS,
				abi: [parseAbiItem("function closeTrade(bytes32 id) external payable")],
				functionName: "closeTrade",
				args: [trade.id],
				value: trade.price
			});

			const { status } = await waitForTransaction({ hash })
			if (status == "reverted") throw "reverted"

			// await walletClient.writeContract({
			// 	address: PXLS,
			// 	abi: [parseAbiItem("function closeTrade(bytes32 id) external payable")],
			// 	functionName: "closeTrade",
			// 	args: [trade.id],
			// 	value: trade.price,
			// 	chain: base,
			// 	gas: 10000000n
			// })
		},

		async conjure(numPixels: number) {
			const { hash } = await writeContract({
				address: PXLS,
				abi: pxlsCoreABI,
				functionName: 'conjure',
				args: [BigInt(numPixels)],
				value: parseEther(PIXEL_PRICE.toString()) * BigInt(numPixels)
			})

			const { status, blockNumber } = await waitForTransaction({ hash, confirmations: import.meta.env.DEV ? 1 : 2 })
			if (status == "reverted") throw "reverted"

			const conjuredLogs = await publicClient.getContractEvents({
				address: PXLS,
				abi: pxlsCoreABI,
				eventName: "Conjured",
				args: {
					to: ctx.account.current
				},
				fromBlock: blockNumber,
				toBlock: blockNumber
			})

			const pixels = bytesToPixels(conjuredLogs[0].args.pixels!)
			ctx.pixels.update(c => c.concat(pixels))

			// TODO
			// const ethFoundLogs = await publicClient.getLogs({
			// 	address: PXLS,
			// 	event: parseAbiItem('event EthFound(address indexed to, uint256 amount)'),
			// 	args: {
			// 		to: ctx.account.current
			// 	},
			// 	fromBlock: blockNumber,
			// 	toBlock: blockNumber
			// })

			// const ethFound = ethFoundLogs[0]?.args.amount ?? BigInt(0)
			const ethFound = BigInt(0)

			return [pixels, ethFound] as const
		},

		async mint(indices: number[], delays: number[][]) {
			const { hash } = await writeContract({
				address: PXLS,
				abi: [parseAbiItem('function mint(uint256[] calldata indices, uint256[] calldata delays) external')],
				functionName: 'mint',
				args: [indices.map(i => BigInt(i)), delays.flat().map(i => BigInt(i))]
			})

			const { status, blockNumber } = await waitForTransaction({ hash })
			if (status == "reverted") throw "reverted"

			const mintedLogs = await publicClient.getLogs({
				address: PLTS,
				event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'),
				args: {
					from: '0x0000000000000000000000000000000000000000',
					to: ctx.account.current
				},
				fromBlock: blockNumber,
				toBlock: blockNumber
			})

			ctx.pixels.update(c => {
				const plate: number[][] = []

				const m = [...c]
				const indicesSorted = indices.sort((a, b) => b - a)
				// pop used pixels
				for (let i = 0; i < indicesSorted.length; i++) {
					const idx = indicesSorted[i];
					const len = m.length - 1;
					if (idx < len) {
						m[idx] = m[len];
						plate.push(m[idx])
					}
					m.pop();
				}

				ctx.plates.update(c => c.concat([{ pixels: plate, delays: delays.map(d => ({ idx: d[0], delay: d[1] })) }]))

				return m
			})

			return mintedLogs[0].args.tokenId!
		},

		async burn() {
			// TODO
		}
	}

	ctx.connect().then(() => ctx.pixels.subscribe(() => { })()) // connect and force sub pixels

	return ctx
}