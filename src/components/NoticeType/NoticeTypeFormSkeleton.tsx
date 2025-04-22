import { Container,Box } from "@mui/material";

export const NoticeTypeFormSkeleton = () => {
    const shimmerStyle = {
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: 1,
    };
  
    return (
      <Container maxWidth="lg" sx={{ py: 0.5 }}>
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
        
        <Box sx={{ mb: 4, height: 40, width: '60%', ...shimmerStyle }} />
        
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Name field shimmer */}
          <Box>
            <Box sx={{ height: 24, width: '30%', ...shimmerStyle, mb: 1 }} />
            <Box sx={{ height: 56, ...shimmerStyle }} />
          </Box>
          
          {/* Description field shimmer */}
          <Box>
            <Box sx={{ height: 24, width: '30%', ...shimmerStyle, mb: 1 }} />
            <Box sx={{ height: 80, ...shimmerStyle }} />
          </Box>
          
          {/* Dynamic field builder shimmer */}
          <Box>
            <Box sx={{ height: 24, width: '40%', ...shimmerStyle, mb: 1 }} />
            <Box sx={{ height: 200, ...shimmerStyle }} />
          </Box>
          
          {/* Buttons shimmer */}
          <Box sx={{ display: "flex", gap: 2, mt: 0 }}>
            <Box sx={{ height: 40, width: 120, ...shimmerStyle }} />
            <Box sx={{ height: 40, width: 120, ...shimmerStyle }} />
          </Box>
        </Box>
      </Container>
    );
  };


