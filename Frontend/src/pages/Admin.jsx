import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Card, Button, Input, Badge } from "@/components/ui";
import useBlockchain from "../hooks/useBlockchain";
import axios from "axios";
import "../styles/Admin.css";

const PORT = import.meta.env.VITE_PORT;

const AdminPage = () => {
  const navigate = useNavigate();
  const { account, handleLogout } = useBlockchain();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [lands, setLands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Base API configuration
  const api = axios.create({
    baseURL: `http://localhost:${PORT}/api`,
    headers: {
      "Content-Type": "application/json",
      "Wallet-Address": localStorage.getItem("connectedAccount") || ""
    }
  });

  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        const storedRole = localStorage.getItem("userRole");
        const storedWallet = localStorage.getItem("connectedAccount");
        
        if (storedRole !== "admin" || !storedWallet) {
          throw new Error("Unauthorized access");
        }

        const verification = await api.get("/auth/check-wallet", {
          params: { walletAddress: storedWallet }
        });
        
        if (!verification.data.isAuthorized || !verification.data.isAdmin) {
          throw new Error("Admin access denied");
        }

        await fetchAllData();
      } catch (error) {
        localStorage.removeItem("userRole");
        localStorage.removeItem("connectedAccount");
        navigate("/");
      }
    };

    verifyAdminAccess();

    return () => {};
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const [usersResponse, landsResponse] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/lands")
      ]);

      const usersData = usersResponse.data?.data || [];
      const landsData = landsResponse.data?.data || [];

      setUsers(usersData);
      setLands(landsData);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTabData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get(`/admin/${activeTab}`);
      const data = response.data?.data || [];

      if (activeTab === "users") {
        setUsers(data);
      } else {
        setLands(data);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiError = (error) => {
    const errorMessage = error.response?.data?.error || 
                       error.message || 
                       "Failed to fetch data. Please try again.";
    setError(errorMessage);
    
    if (activeTab === "users") {
      setUsers([]);
    } else {
      setLands([]);
    }
  };

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    const matches = (
      (user.name?.toLowerCase() || "").includes(search) ||
      (user.email?.toLowerCase() || "").includes(search) ||
      (user.walletAddress?.toLowerCase() || "").includes(search)
    );
    return matches;
  });

  const filteredLands = lands.filter(land => {
    const search = searchTerm.toLowerCase();
    const matches = (
      (land.landId?.toLowerCase() || "").includes(search) ||
      (land.ownerName?.toLowerCase() || "").includes(search) ||
      (land.district?.toLowerCase() || "").includes(search) ||
      (land.status?.toLowerCase() || "").includes(search)
    );
    return matches;
  });

  const handleDeleteUser = async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      await fetchTabData();
    } catch (error) {
      setError(error.response?.data?.error || "Failed to delete user");
    }
  };

  const handleVerifyLand = async (landId) => {
    try {
      const response = await api.post("/admin/lands/verify", { landId });
      await fetchTabData();
    } catch (error) {
      setError(error.response?.data?.error || "Verification failed");
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin data...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <Button 
            variant="outline" 
            onClick={() => fetchAllData()}
          >
            Refresh All Data
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => handleLogout()}
          >
            Logout
          </Button>
        </div>
      </header>

      {error && (
        <div className="admin-error">
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setError("");
              fetchTabData();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      <Card className="admin-content">
        <div className="admin-tabs">
          <Button 
            variant={activeTab === "users" ? "primary" : "outline"}
            onClick={() => setActiveTab("users")}
          >
            Users ({users.length})
          </Button>
          <Button
            variant={activeTab === "lands" ? "primary" : "outline"}
            onClick={() => setActiveTab("lands")}
          >
            Lands ({lands.length})
          </Button>
        </div>

        <div className="admin-search">
          <Input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="tab-content">
          {activeTab === "users" ? (
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Wallet Address</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td className="wallet-address">
                        {user.walletAddress}
                      </td>
                      <td>
                        <Badge variant={user.role === "admin" ? "primary" : "secondary"}>
                          {user.role}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={user.role === "admin"}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      {users.length === 0 ? "No users found" : "No matching users found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Land ID</th>
                  <th>Owner</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLands.length > 0 ? (
                  filteredLands.map((land) => (
                    <tr key={land.landId}>
                      <td className="land-id">{land.landId}</td>
                      <td>
                        <div className="owner-info">
                          <p>{land.ownerName}</p>
                          <small className="wallet-address">
                            {land.ownerAddress}
                          </small>
                        </div>
                      </td>
                      <td>
                        {land.village}, {land.taluk}, {land.district}
                      </td>
                      <td>
                        <Badge 
                          variant={
                            land.status === "Verified" ? "success" :
                            land.status === "Pending" ? "warning" : "destructive"
                          }
                        >
                          {land.status}
                        </Badge>
                      </td>
                      <td>
                        {land.status !== "Verified" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyLand(land.landId)}
                          >
                            Verify
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      {lands.length === 0 ? "No lands found" : "No matching lands found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminPage;