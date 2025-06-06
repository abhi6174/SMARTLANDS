import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Input, Badge, AlertDialog } from "@/components/ui";
import useBlockchain from "../hooks/useBlockchain";
import axios from "axios";
import "../styles/Admin.css";
import { ethers } from "ethers";
import LandRegistryABI from "../contracts/LandRegistryABI";
const PORT = import.meta.env.VITE_PORT;

const SimpleTable = ({ columns, data, emptyMessage }) => {
  return (
    <div className="simple-table-container">
      <table className="simple-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={row._id || rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {column.render 
                      ? column.render(row[column.accessor], row)
                      : row[column.accessor] || "N/A"}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="empty-message">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { account, handleLogout } = useBlockchain();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [lands, setLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [verifyDialog, setVerifyDialog] = useState({
    open: false,
    landId: null,
    action: null,
  });
  const [adminComments, setAdminComments] = useState("");

  const api = axios.create({
    baseURL: `http://localhost:${PORT}/api`,
    headers: {
      "Content-Type": "application/json",
      "Wallet-Address": account || ""
    }
  });

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const [usersResponse, landsResponse] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/lands")
      ]);
      
      setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data?.data || []);
      setLands(Array.isArray(landsResponse.data) ? landsResponse.data : landsResponse.data?.data || []);
      
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.response?.data?.error || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        const verification = await api.get("/auth/check-wallet", {
          params: { walletAddress: account }
        });
        
        if (!verification.data?.isAuthorized || !verification.data?.isAdmin) {
          throw new Error("Admin access denied");
        }
        await fetchAllData();
      } catch (error) {
        console.error("Admin verification failed:", error);
        localStorage.removeItem("connectedAccount");
        navigate("/");
      }
    };

    if (account) verifyAdminAccess();
  }, [account]);

  const handleVerifyLand = async () => {
    try {
      if (verifyDialog.action === 'approve') {
        const land = lands.find(l => l.landId === verifyDialog.landId);
        if (!land) throw new Error("Land record not found");

        // Validate all parameters
        if (!ethers.isAddress(land.walletAddress)) {
          throw new Error("Invalid owner address in land record");
        }

        if (isNaN(land.price) || Number(land.price) <= 0) {
          throw new Error("Invalid land price");
        }

        const { ethereum } = window;
        if (!ethereum) throw new Error("MetaMask not available");

        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        
        // Convert landId to bytes32 format correctly
        const landIdBytes32 = ethers.zeroPadValue(ethers.hexlify(land.landId), 32);
        
        const priceInWei = ethers.parseEther(land.price.toString());
        const landAreaBigNum = ethers.toBigInt(land.landArea);
        const blockNumberBigNum = ethers.toBigInt(land.blockNumber);
        const surveyNumberBigNum = ethers.toBigInt(land.surveyNumber);

        const contract = new ethers.Contract(
          import.meta.env.VITE_CONTRACT_ADDRESS,
          LandRegistryABI,
          signer
        );

        // First check if land exists in contract
        try {
          const exists = await contract.landExists(landIdBytes32);
          if (exists) throw new Error("Land already registered on blockchain");
        } catch (err) {
          console.error("Land check error:", err);
          throw new Error("Failed to check land registration status");
        }

        // Attempt with higher gas limit
        const tx = await contract.verifyAndRegisterLand(
          landIdBytes32,
          land.ownerName,
          landAreaBigNum,
          land.district,
          land.taluk,
          land.village,
          blockNumberBigNum,
          surveyNumberBigNum,
          land.walletAddress,
          land.documentHash,
          priceInWei,
          { gasLimit: 1000000 } // Increased gas limit
        );

        const receipt = await tx.wait();
        if (!receipt.status) throw new Error("Transaction reverted");

        // Update backend
        await api.post("/lands/verify", {
          landId: verifyDialog.landId,
          action: "approve",
          adminComments,
          txHash: tx.hash
        });

        await fetchAllData();
        setVerifyDialog({ open: false, landId: null, action: null });
        setAdminComments("");
        
      } else {
        // Rejection logic remains unchanged
        await api.post("/lands/verify", {
          landId: verifyDialog.landId,
          action: "reject",
          adminComments
        });
        await fetchAllData();
        setVerifyDialog({ open: false, landId: null, action: null });
        setAdminComments("");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setError(error.message || "Transaction failed. See console for details.");
    }
  };

  const filteredData = activeTab === "users" 
    ? users.filter(user => 
        `${user.name || ''}${user.email || ''}${user.walletAddress || ''}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
    : lands.filter(land => 
        `${land.landId || ''}${land.ownerName || ''}${land.district || ''}${land.status || ''}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

  if (isLoading) {
    return <div className="loading-spinner"></div>;
  }

  const landColumns = [
    { 
      header: "Land ID", 
      accessor: "landId",
      render: (val) => val ? `${val.slice(0,8)}...` : "N/A"
    },
    {
      header: "Owner",
      accessor: "ownerName",
      render: (val, row) => (
        <div>
          <div>{val || "N/A"}</div>
          <small>{row.walletAddress ? `${row.walletAddress.slice(0,6)}...${row.walletAddress.slice(-4)}` : "N/A"}</small>
        </div>
      )
    },
    {
      header: "Location",
      accessor: "location",
      render: (val, row) => `${row.village || ''}, ${row.taluk || ''}, ${row.district || ''}`
    },
    { 
      header: "Price", 
      accessor: "price", 
      render: (val) => `${val || 0} MATIC` 
    },
    {
      header: "Document",
      accessor: "documentHash",
      render: (val) => val ? (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${val}`, '_blank')}
        >
          View Document
        </Button>
      ) : "N/A"
    },
    {
      header: "Status",
      accessor: "status",
      render: (val) => (
        <Badge variant={
          val === "Verified" ? "success" :
          val === "Rejected" ? "destructive" : "warning"
        }>
          {val || "Pending"}
        </Badge>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (val, row) => row.status === "Pending" && (
        <div className="action-buttons">
          <Button 
            size="sm" 
            onClick={() => setVerifyDialog({
              open: true,
              landId: row.landId,
              action: "approve"
            })}
          >
            Approve
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setVerifyDialog({
              open: true,
              landId: row.landId,
              action: "reject"
            })}
          >
            Reject
          </Button>
        </div>
      )
    },
    {
      header: "Verification",
      accessor: "verification",
      render: (_, row) => (
        <div>
          {row.blockchainVerified && (
            <Badge variant="success">On-chain</Badge>
          )}
          {row.txHash && (
            <a 
              href={`https://amoy.polygonscan.com/tx/${row.txHash}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="tx-link"
            >
              View TX
            </a>
          )}
        </div>
      )
    }
  ];

  const userColumns = [
    { 
      header: "Name", 
      accessor: "name",
      render: (val) => val || "N/A" 
    },
    { 
      header: "Email", 
      accessor: "email",
      render: (val) => val || "N/A"
    },
    { 
      header: "Wallet", 
      accessor: "walletAddress",
      render: (val) => val ? `${val.slice(0,6)}...${val.slice(-4)}` : "N/A"
    },
    {
      header: "Role",
      accessor: "role",
      render: (val) => (
        <Badge variant={val === "admin" ? "primary" : "secondary"}>
          {val || "user"}
        </Badge>
      )
    },
    {
      header: "Registered",
      accessor: "createdAt",
      render: (val) => val ? new Date(val).toLocaleDateString() : "N/A"
    }
  ];

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <Button onClick={fetchAllData}>Refresh</Button>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          {error}
          <Button size="sm" onClick={() => setError("")}>Dismiss</Button>
        </div>
      )}

      <Card>
        <div className="admin-tabs">
          <Button
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          >
            Users ({users.length})
          </Button>
          <Button
            active={activeTab === "lands"}
            onClick={() => setActiveTab("lands")}
          >
            Pending Lands ({lands.length})
          </Button>
        </div>

        <div className="search-bar">
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === "users" ? (
          <SimpleTable
            columns={userColumns}
            data={filteredData}
            emptyMessage="No users found"
          />
        ) : (
          <SimpleTable
            columns={landColumns}
            data={filteredData}
            emptyMessage="No pending lands found"
          />
        )}
      </Card>

      <AlertDialog
        open={verifyDialog.open}
        onClose={() => setVerifyDialog({ open: false, landId: null, action: null })}
        title={`${verifyDialog.action === 'approve' ? 'Approve' : 'Reject'} Land`}
      >
        <div className="dialog-content">
          <p>Are you sure you want to {verifyDialog.action} this land registration?</p>
          <textarea
            placeholder="Enter comments (optional)"
            value={adminComments}
            onChange={(e) => setAdminComments(e.target.value)}
          />
          <div className="dialog-actions">
            <Button variant="outline" onClick={() => setVerifyDialog({ open: false })}>
              Cancel
            </Button>
            <Button 
              variant={verifyDialog.action === 'approve' ? 'primary' : 'destructive'}
              onClick={handleVerifyLand}
            >
              Confirm {verifyDialog.action}
            </Button>
          </div>
        </div>
      </AlertDialog>
    </div>
  );
};

export default AdminPage;