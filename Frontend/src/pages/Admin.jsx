import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Input, Badge, AlertDialog } from "@/components/ui";
import useBlockchain from "../hooks/useBlockchain";
import axios from "axios";
import "../styles/Admin.css";
import { ethers } from "ethers";
import LandRegistryABI from "../contracts/LandRegistryABI";
const PORT = import.meta.env.VITE_PORT;


// Basic Table Component since your custom one might not be working
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
    isBlockchain: false
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
      ])
      console.log("Users response:", usersResponse);
      console.log("Lands response:", landsResponse);
    ;
      
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
      const { ethereum } = window;
      if (!ethereum) throw new Error("MetaMask not installed");
  
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const landRegistry = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS,
        LandRegistryABI,
        signer
      );
  
      const land = lands.find(l => l.landId === verifyDialog.landId);
      if (!land) throw new Error("Land not found");
  
      // Debug log all parameters
      console.log("Contract call parameters:", {
        landId: land.landId,
        ownerName: land.ownerName,
        landArea: land.landArea,
        district: land.district,
        taluk: land.taluk,
        village: land.village,
        blockNumber: land.blockNumber,
        surveyNumber: land.surveyNumber,
        ownerAddress: land.walletAddress,
        documentHash: land.documentHash,
        price: ethers.parseEther(land.price.toString())
      });
  
      // Estimate gas first to catch potential reverts
      try {
        const gasEstimate = await landRegistry.verifyAndRegisterLand.estimateGas(
          land.landId,
          land.ownerName,
          land.landArea,
          land.district,
          land.taluk,
          land.village,
          land.blockNumber,
          land.surveyNumber,
          land.walletAddress,
          land.documentHash,
          ethers.parseEther(land.price.toString())
        );
        console.log("Gas estimate:", gasEstimate.toString());
      } catch (estimateError) {
        console.error("Gas estimation failed:", estimateError);
        throw new Error("Contract validation failed: " + estimateError.reason || estimateError.message);
      }
  
      // Execute transaction
      const tx = await landRegistry.verifyAndRegisterLand(
        land.landId,
        land.ownerName,
        land.landArea,
        land.district,
        land.taluk,
        land.village,
        land.blockNumber,
        land.surveyNumber,
        land.walletAddress,
        land.documentHash,
        ethers.parseEther(land.price.toString()),
        { gasLimit: 500000 } // Add explicit gas limit
      );
  
      const receipt = await tx.wait();
      console.log("Transaction mined:", receipt);
  
      // Update backend
      const response = await api.post("/lands/verify", {
        landId: verifyDialog.landId,
        action: verifyDialog.action,
        adminComments,
        isBlockchain: true,
        txHash: tx.hash
      });
  
      if (response.data.success) {
        await fetchAllData();
        setVerifyDialog({ open: false, landId: null, action: null });
        setAdminComments("");
      }
    } catch (error) {
      let errorMessage = error.message;
  
      // Try to decode custom error
      if (error.data) {
        try {
          const iface = new ethers.Interface(LandRegistryABI);
          const decodedError = iface.parseError(error.data);
          errorMessage = decodedError?.name || errorMessage;
        } catch (decodeError) {
          console.log("Couldn't decode error:", decodeError);
        }
      }
      
      setError(errorMessage);
      console.error("Full error details:", {
        message: error.message,
        data: error.data,
        code: error.code,
        stack: error.stack
      });
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
            columns={[
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
            ]}
            data={filteredData}
            emptyMessage="No users found"
          />
        ) : (
          <SimpleTable
            columns={[
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
                        action: "approve",
                        isBlockchain: !!row.walletAddress
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
                        action: "reject",
                        isBlockchain: !!row.walletAddress
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
            ]}
            
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