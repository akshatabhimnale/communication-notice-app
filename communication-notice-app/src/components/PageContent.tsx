import { Card, CardContent, Typography } from "@mui/material";

export default function DemoPageContent({ title }: { title: string }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h4">{title}</Typography>
        <Typography variant="body1">This is a {title} page.</Typography>
      </CardContent>
    </Card>
  );
}
