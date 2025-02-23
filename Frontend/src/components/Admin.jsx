import { useEffect, useState } from "react";
import "./AdminPage.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [lands, setLands] = useState([]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));

    fetch("/api/non-verified-lands")
      .then((res) => res.json())
      .then((data) => setLands(data));
  }, []);

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Dashboard</h1>
      
      {/* Registered Users */}
      <Card>
        <CardContent>
          <h2 className="admin-section-title">Registered Users</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Non-Verified Lands */}
      <Card>
        <CardContent>
          <h2 className="admin-section-title">Non-Verified Lands</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lands.map((land) => (
                <TableRow key={land.id}>
                  <TableCell>{land.id}</TableCell>
                  <TableCell>{land.owner}</TableCell>
                  <TableCell>{land.location}</TableCell>
                  <TableCell>
                    <Button variant="outline">Verify</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
