pragma solidity ^0.5.9;

import './TPT.sol';

contract TPTGOV {
    
    address creator;
    address tronpredicttoken;
    
    mapping(address => uint256) beneficiaries;
    address[] beneficiarylist;
    
    constructor() public {
        creator = msg.sender;
    }
    
    function settokenaddress(address tpt) public {
        if(msg.sender == creator) {
            tronpredicttoken = tpt;
        }
    }
    
    function addbeneficiary(address _beneficiary, uint256 _percentage) public returns (bool) {
        bool rtn = false;
        
        if(msg.sender == creator) {
            beneficiaries[_beneficiary] = _percentage;
            beneficiarylist.push(_beneficiary);

            rtn = true;
        }
        
        return rtn;
    }
    
    function removebeneficiary(address _beneficiary) public returns (bool) {
        bool rtn = false;
        
        if(msg.sender == creator) {
            delete beneficiaries[_beneficiary];
            
            for(uint256 i = 0; i < beneficiarylist.length; i++) {
                address ben = beneficiarylist[i];
                
                if(ben == _beneficiary) {
                    delete beneficiarylist[i];
                }
            }

            rtn = true;
        }
        
        return rtn;
    }
    
    // automated function - invoked weekly
    function transfertobeneficiaries() public returns (bool) {
        require(msg.sender == creator, "Automated function signed by creator");
        
        TPT tpt = TPT(tronpredicttoken);
        uint256 bal = tpt.balanceOf(address(this));

        for(uint256 i = 0; i < beneficiarylist.length; i++) {
            address _beneficiary = beneficiarylist[i];
            uint256 percentage = beneficiaries[_beneficiary];
            
            uint256 payamount = (bal * percentage) / 100;
            
            tpt.transfer(_beneficiary, payamount);
        }
        
        return true;
    }
    
    function getbeneficiarypercentage() public view returns (uint256) {
        return beneficiaries[msg.sender];
    }
    
    function getcontractbalance() public view returns (uint256) {
        TPT tpt = TPT(tronpredicttoken);
        
        return tpt.balanceOf(address(this));
    }
    
}