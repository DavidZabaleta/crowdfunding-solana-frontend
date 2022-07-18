import './App.css';
import {useCallback, useEffect, useState} from "react";

const App = () => {
    const [walletAddress, setWalletAddress] = useState(null);
    const { solana } = window;

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

    const renderNotConnectedContainer = () => <button onClick={connectNewWallet}>Connect Wallet</button>;

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
        </div>
    );
}

export default App;
