'use client';

import React from 'react';
import { Box, Skeleton, Typography, Card, CardContent } from '@mui/material';

export const ProfileSkeleton = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} >
      <Typography variant="h4">
        <Skeleton width={160} />
      </Typography>

      {/* Avatar */}
      <Skeleton variant="circular" width={100} height={100} />

      {/* Name + Role */}
      <Skeleton width={100} height={28} />
      <Skeleton width={60} height={20} />

      {/* Info Card */}
      <Card sx={{ mt: 0, width: 400, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          {[...Array(4)].map((_, i) => (
            <Box key={i} mb={2}>
              <Skeleton width="50%" height={18} />
              <Skeleton width="80%" height={24} />
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Edit Button */}
      <Skeleton variant="rectangular" width={120} height={40} />
    </Box>
  );
};

