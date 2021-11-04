document.getElementById("test").textContent="A";
if (window.ethereum) {
    handleEthereum();

} else {
    window.addEventListener('ethereum#initialized', handleEthereum, {
    once: true,
    });

    // If the event is not dispatched by the end of the timeout,
    // the user probably doesn't have MetaMask installed.
    setTimeout(handleEthereum, 3000); // 3 seconds
}

function handleEthereum() {
    const { ethereum } = window;
    if (ethereum && ethereum.isMetaMask) {
    console.log('Ethereum successfully detected!');
    document.getElementById("test").textContent="Ethereum successfully detected!";
    // Access the decentralized web!
    } else {
    console.log('Please install MetaMask!');
    document.getElementById("test").textContent="Please install MetaMask!";
    }
}