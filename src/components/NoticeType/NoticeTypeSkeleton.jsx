import { Box } from "@mui/material";

export const NoticeTypeSkeleton = () => {
  const shimmerStyle = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: 1,
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '95vw', mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      
      {/* Search and Create button row */}
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box sx={{ 
          height: 40, 
          width: { xs: '100%', sm: 300 },
          ...shimmerStyle 
        }} />
        <Box sx={{ 
          height: 40, 
          width: { xs: '100%', sm: 150 },
          ...shimmerStyle 
        }} />
      </Box>

      {/* DataGrid header row - scrollable on mobile */}
      <Box sx={{ 
        display: "flex", 
        mb: 1, 
        height: 56, 
        backgroundColor: "#f5f5f5",
        borderRadius: 1,
        overflowX: 'auto',
        overflowY: 'hidden',
        minWidth: '100%'
      }}>
        <Box sx={{ display: 'flex', minWidth: '100%' }}>
          {[...Array(5)].map((_, i) => (
            <Box 
              key={i}
              sx={{ 
                flex: i === 2 ? 3 : i === 1 ? 2.5 : i === 0 ? 2 : 1.5,
                minWidth: { xs: 150, sm: 'auto' },
                ...shimmerStyle,
                height: "100%",
                borderRight: i < 4 ? "1px solid #e0e0e0" : "none"
              }} 
            />
          ))}
        </Box>
      </Box>

      {/* DataGrid rows - scrollable on mobile */}
      <Box sx={{ overflowX: 'auto' }}>
        {[...Array(10)].map((_, rowIndex) => (
          <Box 
            key={rowIndex}
            sx={{ 
              display: "flex", 
              mb: 1, 
              height: 52,
              borderRadius: 1,
              overflow: "hidden",
              minWidth: '100%'
            }}
          >
            {[...Array(5)].map((_, colIndex) => (
              <Box
                key={colIndex}
                sx={{
                  flex: colIndex === 2 ? 3 : colIndex === 1 ? 2.5 : colIndex === 0 ? 2 : 1.5,
                  minWidth: { xs: 150, sm: 'auto' },
                  ...shimmerStyle,
                  height: "100%",
                  borderRight: colIndex < 4 ? "1px solid #e0e0e0" : "none",
                  opacity: 0.9 - (rowIndex * 0.05)
                }}
              />
            ))}
          </Box>
        ))}
      </Box>

      {/* Pagination area */}
      <Box sx={{ 
        display: "flex", 
        justifyContent: "flex-end", 
        mt: 2,
        width: '100%',
        overflowX: 'auto'
      }}>
        <Box sx={{ 
          height: 40, 
          width: { xs: '100%', sm: 200 },
          ...shimmerStyle 
        }} />
      </Box>
    </Box>
  );
};