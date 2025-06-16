import * as React from 'react';
import Typography from '@mui/material/Typography';
import { AdminOnly, UserOnly, UserOrAdmin } from "@/components/auth/RoleGuard";
export default async function HomePage() {
  return <>
      {/* <Typography>Welcome to Toolpad</Typography> */}
      
      {/* 🔴 Admin Only Section */}
      <AdminOnly>
        <div style={{ 
          backgroundColor: '#ffebee', 
          padding: '16px', 
          margin: '16px 0',
          border: '2px solid #f44336',
          borderRadius: '8px'
        }}>
          <h2 style={{ color: '#c62828' }}>🔴 ADMIN ONLY SECTION</h2>
          <p style={{ color: '#f44336' }}>This content is only visible to admins</p>
          <button style={{ 
            backgroundColor: '#f44336', 
            color: 'white', 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '4px' 
          }}>
            Delete All Users
          </button>
        </div>
      </AdminOnly>

      {/* 🔵 User Only Section */}
      <UserOnly>
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '16px', 
          margin: '16px 0',
          border: '2px solid #2196f3',
          borderRadius: '8px',
          
        }}>
          <h2 style={{ color: '#1565c0' }}>🔵 USER ONLY SECTION</h2>
          <p style={{ color: '#2196f3' }}>This content is only visible to regular users</p>
          <button style={{ 
            backgroundColor: '#2196f3', 
            color: 'white', 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '4px' 
          }}>
            View My Profile
          </button>
        </div>
      </UserOnly>

      {/* 🟢 User OR Admin Section */}
      <UserOrAdmin>
        <div style={{ 
          backgroundColor: '#e8f5e8', 
          padding: '16px', 
          margin: '16px 0',
          border: '2px solid #4caf50',
          borderRadius: '8px'
        }}>
          <h2 style={{ color: '#2e7d32' }}>🟢 USER OR ADMIN SECTION</h2>
          <p style={{ color: '#4caf50' }}>This content is visible to both users and admins</p>
          <button style={{ 
            backgroundColor: '#4caf50', 
            color: 'white', 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '4px' 
          }}>
            Generate Report
          </button>
        </div>
      </UserOrAdmin>

      {/* 🟡 Testing with Fallback */}
      <AdminOnly fallback={
        <div style={{ 
          backgroundColor: '#fff3e0', 
          padding: '16px',
          margin: '16px 0',
          border: '2px solid #ff9800',
          borderRadius: '8px'
        }}>
          <h2 style={{ color: '#ef6c00' }}>🟡 FALLBACK MESSAGE</h2>
          <p style={{ color: '#ff9800' }}>You don't have admin privileges to see the admin content</p>
        </div>
      }>
        <div style={{ 
          backgroundColor: '#ffebee', 
          padding: '16px', 
          margin: '16px 0',
          border: '2px solid #f44336',
          borderRadius: '8px'
        }}>
          <h2 style={{ color: '#c62828' }}>🔴 ADMIN SECTION WITH FALLBACK</h2>
          <p style={{ color: '#f44336' }}>This will show fallback message for non-admins</p>
        </div>
      </AdminOnly>
    </>
}
