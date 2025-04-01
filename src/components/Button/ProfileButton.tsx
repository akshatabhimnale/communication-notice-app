import { useState, MouseEvent } from "react";
import { styled } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { keyframes } from "@emotion/react";


const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  width: 40, 
  height: 40,
  marginRight: theme.spacing(1), 
  background: `linear-gradient(45deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
  borderRadius: "50%",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    animation: `${pulse} 0.8s infinite`,
    background: `linear-gradient(45deg, ${theme.palette.primary.main}40, ${theme.palette.secondary.main}40)`,
    boxShadow: `0 0 12px ${theme.palette.primary.main}50`,
  },
  [theme.breakpoints.down("sm")]: {
    width: 36,
    height: 36,
    marginRight: theme.spacing(0.5), 
  },
}));


const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 12,
    minWidth: 180,
    background: theme.palette.background.paper,
    boxShadow: `0 4px 20px ${theme.palette.grey[800]}33`,
    border: `1px solid ${theme.palette.divider}`,
    overflow: "hidden",
  },
}));


const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  transition: "all 0.2s ease",
  "&:hover": {
    background: `linear-gradient(90deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
    transform: "translateX(4px)",
  },
}));

const ProfileButton = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <StyledIconButton 
        onClick={handleClick} 
        color="inherit"
        aria-label="profile menu"
      >
        <AccountCircleIcon 
          fontSize="large" 
          sx={{ 
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
            transition: "filter 0.3s",
            "&:hover": {
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
            }
          }} 
        />
      </StyledIconButton>
      <StyledMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1,
            },
          },
        }}
      >
        <StyledMenuItem 
          onClick={() => { 
            window.location.href = "/admin/profile"; 
            handleClose(); 
          }}
        >
          Go to Profile
        </StyledMenuItem>
        <StyledMenuItem onClick={handleClose}>
          Edit Profile
        </StyledMenuItem>
      </StyledMenu>
    </>
  );
};

export default ProfileButton;