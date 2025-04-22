import { Box, Container, Skeleton } from "@mui/material";

export function NoticeTypeViewSkeleton() {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header: Title and Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Skeleton variant="text" width={300} height={40} />
        <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Details Card */}
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={150} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Dynamic Schema Card */}
      <Box>
        <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 1 }} />
      </Box>
    </Container>
  );
}