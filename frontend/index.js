const contract_address = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

let current_account;
let web3;
let contract;

document.addEventListener('DOMContentLoaded', () => {
    const connection_btn = document.getElementById('connection_btn');
    if (connection_btn) connection_btn.addEventListener('click', connectWallet);

    const makePost_btn = document.getElementById('makePost_btn');
    if (makePost_btn) makePost_btn.addEventListener('click', makePost);

    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(abi, contract_address);

        window.ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length === 0) {
                alert("Accounts not found");
                current_account = undefined;
                return;
            }
            current_account = accounts[0];
            enterToDapp();
        });

        contract.events.PostCreated({ fromBlock: "latest" })
            .on("data", async (event) => {
                console.log("Post created: ", event.returnValues);
                await getPosts();
            });

        getPosts();
    }

    const deleteAllPosts_btn = document.getElementById('deleteAllPosts_btn');
    if (deleteAllPosts_btn) {
        deleteAllPosts_btn.addEventListener('click', deleteAllPosts);
    }
});

const makePost = async () => {
    try {
        const post_text = document.getElementById("post_text");
        if (!post_text || !post_text.value.trim()) {
            alert("Post cannot be without text!");
            return;
        }

        const message = post_text.value;

        await contract.methods.create_post(message).send({ from: current_account });
        post_text.value = '';

    } catch (error) {
        console.error("Make post error: ", error);
        alert("Make post error. See logs");
    }
};

const connectWallet = async (e) => {
    if (!window.ethereum) {
        alert("Please install web3 provider");
        return;
    }
    try {
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
            alert("Accounts not found");
            return;
        }
        current_account = accounts[0];
        if (e && e.target) e.target.hidden = true;
        enterToDapp();
        await getPosts();
    } catch (error) {
        alert("Connect to DApp error. See logs");
        console.error("Connect error: ", error);
    }
};

const enterToDapp = () => {
    const account_lbl = document.getElementById('account_lbl');
    account_lbl.hidden = false;
    account_lbl.textContent = current_account;
    account_lbl.style.color = 'darkgreen';

    const dapp = document.getElementById('dapp');
    if (dapp) dapp.hidden = false;
};

const getPosts = async () => {
    try {
        const posts = await contract.methods.get_posts().call();
        await renderPosts(posts);
    } catch (error) {
        console.error("Get posts error: ", error);
        alert("Trouble with get posts. See logs");
    }
};

const renderPosts = async (posts) => {
    const postList = document.getElementById("postList");

    while (postList.firstChild) {
        postList.removeChild(postList.firstChild);
    }

    if (posts.length === 0) {
        const p = document.createElement('p');
        p.textContent = "No posts yet";
        postList.appendChild(p);
        return;
    }

    for (let index = 0; index < posts.length; index++) {
        const post = posts[index];
        const div = document.createElement('div');

        const author = document.createElement('p');
        author.textContent = `Author: ${post.author}`;

        const content = document.createElement('p');
        content.textContent = `Content: ${post.content}`;

        const timestamp = document.createElement('p');
        timestamp.textContent = `Created at: ${new Date(Number(post.timestamp) * 1000).toLocaleString()}`;

        const likes = document.createElement('p');
        likes.textContent = `👍: ${post.like}`;

        const likeBtn = document.createElement('button');

        let userHasLiked = false;
        if (current_account) {
            userHasLiked = await contract.methods.hasLiked(index, current_account).call();
        }

        likeBtn.textContent = userHasLiked ? '💔 Unlike' : '👍 Like';
        likeBtn.onclick = () => toggleLike(index);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deletePost(index);

        div.appendChild(author);
        div.appendChild(content);
        div.appendChild(timestamp);
        div.appendChild(likes);
        div.appendChild(likeBtn);
        div.appendChild(deleteBtn);
        div.appendChild(document.createElement('hr'));

        postList.appendChild(div);
    }
};

const toggleLike = async (index) => {
    try {
        if (!current_account) {
            alert("Please connect your wallet first");
            return;
        }

        await contract.methods.toggle_like(index).send({ from: current_account });
        await getPosts();
    } catch (error) {
        console.error("Toggle like error: ", error);
        alert("Error toggling like. See logs");
    }
};

const deletePost = async (index) => {
    try {
        if (!current_account) {
            alert("Please connect your wallet first");
            return;
        }

        await contract.methods.delete_post(index).send({ from: current_account });
        await getPosts();
    } catch (error) {
        console.error("Delete post error: ", error);
        alert("Delete post error. See logs");
    }
};

const deleteAllPosts = async () => {
    try {
        if (!current_account) {
            alert("Please connect your wallet first");
            return;
        }

        await contract.methods.delete_all_posts().send({ from: current_account });
        await getPosts();
    } catch (error) {
        console.error("Delete all posts error: ", error);
        alert("Delete all posts error. See logs");
    }
};