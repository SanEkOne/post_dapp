// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Forum {
    
    struct Post{
        string content;
        address author;
        uint timestamp;
        uint like;
    }


    event PostCreated(address indexed author, uint timestamp);
    event PostDeleted(uint index);

    Post[] posts;

    function create_post(string memory content) external{
        posts.push(
            Post(content, msg.sender, block.timestamp, 0)
        );
        emit PostCreated(msg.sender, block.timestamp);
    }

    function get_posts() external view returns (Post[] memory) {
        return posts;
    }
    function get_post(uint id)external view returns(Post memory){
        require(id < posts.length, "Not found");
        return posts[id];
    }
    function delete_post(uint index) external {
        require(index < posts.length, "Index out of bounds");
        posts[index] = posts[posts.length - 1];
        posts.pop();

        emit PostDeleted(index); 
    }
    function delete_all_posts() external {
        delete posts;
    }
}
