// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Forum {
    
    struct Post {
        string content;
        address author;
        uint timestamp;
        uint like;
    }

    event PostCreated(address indexed author, uint timestamp);
    event PostDeleted(uint index);
    event PostLiked(uint index, address indexed user, uint totalLikes, bool isLiked);

    Post[] posts;
    mapping(uint256 => mapping(address => bool)) public hasLiked;

    function create_post(string memory content) external {
        posts.push(
            Post(content, msg.sender, block.timestamp, 0)
        );
        emit PostCreated(msg.sender, block.timestamp);
    }

    function get_posts() external view returns (Post[] memory) {
        return posts;
    }

    function get_post(uint id) external view returns (Post memory) {
        require(id < posts.length, "Not found");
        return posts[id];
    }

    function toggle_like(uint index) external {
        require(index < posts.length, "Index out of bounds");

        if (hasLiked[index][msg.sender]) {
            hasLiked[index][msg.sender] = false;
            posts[index].like -= 1;
            emit PostLiked(index, msg.sender, posts[index].like, false);
        } else {
            hasLiked[index][msg.sender] = true;
            posts[index].like += 1;
            emit PostLiked(index, msg.sender, posts[index].like, true);
        }
    }

    function delete_post(uint index) external {
        require(index < posts.length, "Index out of bounds");
        
        uint lastIndex = posts.length - 1;
        
        if (index != lastIndex) {
             posts[index] = posts[lastIndex];
        }
        
        posts.pop();
        emit PostDeleted(index); 
    }

    function delete_all_posts() external {
        delete posts;
    }
}