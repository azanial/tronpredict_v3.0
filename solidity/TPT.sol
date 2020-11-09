pragma solidity ^0.5.10;

interface ITRC20 {

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract TPT is ITRC20 {

    string public constant name = "TronPredict Token";
    string public constant symbol = "TPT";
    uint8 public constant decimals = 6;

    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Burn(address indexed from, uint256 tokens);
    event Mine(address indexed miner, uint256 tokens);

    mapping(address => uint256) balances;
    mapping(address => mapping (address => uint256)) allowed;

    uint256 totSupply;
    uint256 mined;

    address creator;
    address tronpredict;
    address governance;
    address dex;

    using SafeMath for uint256;

    constructor(uint256 _supply) public {
        creator = msg.sender;
        totSupply = _supply * 10 ** uint256(decimals);
        mined = 0 * 10 ** uint256(decimals);
    }

    function totalSupply() public view returns (uint256) {
        return totSupply;
    }

    function balanceOf(address tokenOwner) public view returns (uint256) {
        return balances[tokenOwner];
    }

    function transfer(address receiver, uint256 numTokens) public returns (bool) {
        require(numTokens <= balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender].sub(numTokens);
        balances[receiver] = balances[receiver].add(numTokens);
        emit Transfer(msg.sender, receiver, numTokens);
        return true;
    }

    function approve(address delegate, uint256 numTokens) public returns (bool) {
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
    }

    function allowance(address owner, address delegate) public view returns (uint) {
        return allowed[owner][delegate];
    }

    function transferFrom(address owner, address buyer, uint256 numTokens) public returns (bool) {
        require(numTokens <= balances[owner]);
        require(numTokens <= allowed[owner][msg.sender]);

        balances[owner] = balances[owner].sub(numTokens);
        allowed[owner][msg.sender] = allowed[owner][msg.sender].sub(numTokens);
        balances[buyer] = balances[buyer].add(numTokens);
        emit Transfer(owner, buyer, numTokens);
        
        return true;
    }
    
    function burn(uint256 numTokens) public returns (bool) {
        require(balances[msg.sender] >= numTokens);
        
        balances[msg.sender] -= numTokens;
        totSupply -= numTokens;
        mined -= numTokens;
        
        emit Burn(msg.sender, numTokens);
        
        return true;
    }

    function burnFrom(address owner, uint256 numTokens) public returns (bool) {
        require(balances[owner] >= numTokens);
        require(numTokens <= allowed[owner][msg.sender]);
        
        balances[owner] -= numTokens;
        allowed[owner][msg.sender] -= numTokens;
        totSupply -= numTokens;
        mined -= numTokens;
        
        emit Burn(owner, numTokens);
        
        return true;
    }
    
    function setTronPredict(address _tronpredict) public returns (bool) {
        require(msg.sender == creator, "Only the creator can set");
        
        tronpredict = _tronpredict;

        return true;
    }
    
    function setTPTGov(address _tptgov) public returns (bool) {
        require(msg.sender == creator, "Only the creator can set");
        
        governance = _tptgov;

        return true;
    }
    
    function setDEX(address _dex) public returns (bool) {
        require(msg.sender == creator, "Only the creator can set");
        
        dex = _dex;

        return true;
    }
    
    function preMine(address miner, address affiliate, uint256 amount) public returns (uint256) {
        require(msg.sender == tronpredict, "Can only be mined via TronPredict");
        
        uint256 rtn;
        
        if(amount >= 50) {
            uint256 uTokens = amount / 5;
            balances[miner] += uTokens;
            mined += uTokens;
            
            uint256 aTokens = uTokens / 2;
            balances[affiliate] += aTokens;
            mined += aTokens;
            
            uint256 gTokens = (uTokens * 96) / 100;
            balances[governance] += gTokens;
            mined += gTokens;
            
            uint256 mTokens = uTokens + aTokens + gTokens;
            
            emit Mine(miner, mTokens);
            
            rtn = mTokens;
        } else {
            rtn = 0;
        }

        return rtn;
    }
    
    function mine(address miner, address affiliate, uint256 amount, uint256 divisible) public returns (uint256) {
        require(msg.sender == tronpredict, "Can only be mined via TronPredict");

        uint256 rtn;
        
        if(mined < totSupply) {
            uint256 uTokens = amount / divisible;
            balances[miner] += uTokens;
            mined += uTokens;
            
            uint256 aTokens = uTokens / 2;
            balances[affiliate] += aTokens;
            mined += aTokens;
            
            uint256 gTokens = (uTokens * 96) / 100;
            balances[governance] += gTokens;
            mined += gTokens;
            
            uint256 mTokens = uTokens + aTokens + gTokens;
            
            emit Mine(miner, mTokens);
            
            rtn = mTokens;
        } else {
            rtn = 0;
        }
        
        return rtn;
    }
    
    function dexmine(address miner, uint256 numTokens) public returns (bool) {
        require(msg.sender == dex, "Can only be mined by Approved DEX");
        require(mined < totSupply);

        balances[miner] += numTokens;
        mined += numTokens;
        
        emit Mine(miner, numTokens);
        
        return true;
    }
    
    function totalMined() public view returns (uint256) {
        return mined;
    }
}

library SafeMath {
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
      assert(b <= a);
      return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
      uint256 c = a + b;
      assert(c >= a);
      return c;
    }
}
