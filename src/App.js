import './App.css';
import idl from "./idl.json"
import {useCallback, useEffect, useState} from "react";
import {clusterApiUrl, Connection, PublicKey} from "@solana/web3.js";
import {AnchorProvider, Program, utils, web3} from "@project-serum/anchor";
import {Buffer} from "buffer"

window.Buffer = Buffer;

const programId = new PublicKey(idl.metadata.address);
const network = clusterApiUrl("devnet");
const opts = {
    preflightCommitment: "processed"
};
const { SystemProgram } = web3;

const App = () => {
    const [walletAddress, setWalletAddress] = useState(null);
    const { solana } = window;

    const getProvider = () => {
        const connection = new Connection(network, opts.preflightCommitment);

        return new AnchorProvider(connection, solana, opts.preflightCommitment);
    }

    const checkIfWalletIsConnected = () => {
        try {
            if (!solana)
                return "Solana object not found";

            if (solana.isPhantom)
                return "Phantom wallet found!";

        } catch (e) {
            console.error(e);
        }
    };

    const connectWallet = useCallback(async () => {
        const response = await solana.connect({
            onlyIfTrusted: true
        });
        console.log("Connected with public key:", response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
    }, [solana]);

    const connectNewWallet = async () => {
        const response = await solana.connect();
        console.log("New connection with public key:", response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
    }

    const createCampaign = async () => {
        try {
            const provider = getProvider();
            const program = new Program(idl, programId, provider);
            const [campaign] = await PublicKey.findProgramAddress(
                [
                    utils.bytes.utf8.encode("CAMPAIGN_DEMO"),
                    provider.wallet.publicKey.toBuffer()
                ],
                program.programId
            );

            await program.rpc.create("campaign name", "campaign description", {
                accounts: {
                    campaign,
                    user: provider.wallet.publicKey,
                    systemProgram: SystemProgram.programId
                }
            });

            console.log("Create new campaign with address:", campaign.toString());
        } catch (e) {
            console.error("Error creating campaign account:", e);
        }
    };

    const renderNotConnectedContainer = () => <button onClick={connectNewWallet}>Connect Wallet</button>;
    const renderConnectedContainer = () => <button onClick={createCampaign}>Create a campaign…</button>;

    useEffect(() => {
        const onLoad = async () => {
            if (solana)
                await connectWallet();
        };

        window.addEventListener("load", onLoad);
        return () => window.removeEventListener("load", onLoad);
    }, [connectWallet, solana]);

    return (
        <div className="App">
            <p>{checkIfWalletIsConnected()}</p>
            {(!walletAddress && solana) && renderNotConnectedContainer()}
            {walletAddress && renderConnectedContainer()}
        </div>
    );
}

export default App;
