import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../../components/confirm-dialog';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
import { deleteAbstract, getAllAbstracts } from '../../controller/abstractController';

const AbstractTable = () => {
  const [abstracts, setAbstracts] = useState([]);
  const [selectedAbstracts, setSelectedAbstracts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [openPopover, setOpenPopover] = useState(null);
  const [selectedAbstractId, setSelectedAbstractId] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const abstractsData = await getAllAbstracts();
        setAbstracts(abstractsData);
      } catch (error) {
        console.error('Error fetching abstracts:', error);
      }
    };
    fetchData();
  }, []);
  const handleCheckboxChange = (abstractId) => {
    if (abstractId === 'all') {
      setSelectedAbstracts(
        selectedAbstracts.length === abstracts.length
          ? []
          : abstracts.map((abstract) => abstract.id)
      );
    } else {
      const newSelected = selectedAbstracts.includes(abstractId)
        ? selectedAbstracts.filter((id) => id !== abstractId)
        : [...selectedAbstracts, abstractId];
      setSelectedAbstracts(newSelected);
    }
  };
  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };
  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };
  const isSelected = (abstractId) => selectedAbstracts.indexOf(abstractId) !== -1;
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleViewRow = (id) => {
    navigate(`/dashboard/abstract/${id}`);
  };
  const handleEditRow = (id) => {
    // navigate(PATH_DASHBOARD.conference.edit(id));
    navigate(`/dashboard/abstract/${id}/edit`);
  };
  const handleDeleteproperties = async () => {
    if (selectedPropertyId) {
      try {
        await deleteAbstract(selectedPropertyId);
        console.log('Property deleted successfully');
        enqueueSnackbar('Property deleted successfully', { variant: 'success' });
        setAbstracts(abstracts.filter((property) => property.id !== selectedPropertyId));
        handleCloseConfirm();
      } catch (error) {
        console.error('Error deleting property:', error);
        enqueueSnackbar('Error deleting property', { variant: 'error' });
      }
    } else {
      console.error('No property ID selected for deletion');
      enqueueSnackbar('No property ID selected for deletion', { variant: 'warning' });
    }
  };
  const filteredAbstracts = abstracts.filter((abstract) => {
    const isValid = true; // Add your filtering logic here
    return isValid;
  });
  return (
    <>
      <CustomBreadcrumbs
        heading="Abstract - Journal List"
        links={[{ name: 'Dashboard' }, { name: 'Abstract - Journal' }, { name: 'List' }]}
        action={
          <Button
            component={RouterLink}
            to="/dashboard/abstractjournal/new"
            variant="contained"
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            New
          </Button>
        }
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Journal</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Publisher</TableCell>
              {/* <TableCell>View</TableCell> */}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAbstracts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((abstract, index) => {
                const isItemSelected = isSelected(abstract.id);
                return (
                  <TableRow
                    key={abstract.id}
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    selected={isItemSelected}
                    onClick={() => handleViewRow(abstract.id)}
                  >
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{abstract.title}</TableCell>
                    <TableCell>{abstract.journalName}</TableCell>
                    <TableCell>{abstract.authorName}</TableCell>
                    <TableCell>{abstract.publisher}</TableCell>
                    {/* <TableCell>
                                        <IconButton onClick={() => handleViewRow(abstract.id)}>
                                            <Iconify icon="eva:eye-fill" />
                                        </IconButton>
                                    </TableCell> */}
                    <TableCell>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton
                            onClick={() => {
                              setSelectedPropertyId(abstract.id);
                              handleOpenConfirm();
                            }}
                            sx={{ color: 'error.main', marginRight: 1 }}
                          >
                            <Iconify icon="eva:trash-2-outline" />
                          </IconButton>
                          <IconButton onClick={(event) => handleEditRow(abstract.id)}>
                            <Iconify icon="eva:edit-fill" />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={handleDeleteproperties}>
            Delete
          </Button>
        }
      />
      <TablePagination
        component="div"
        count={filteredAbstracts.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
};
export default AbstractTable;
// import VideoCallIcon from '@mui/icons-material/VideoCall';
// import {
//   Avatar,
//   Box,
//   Button,
//   Container,
//   Paper,
//   TextField,
//   Typography
// } from '@mui/material';
// import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
// import { useState } from 'react';

// const ZegocloudVideoCall = () => {
//   const [roomId, setRoomId] = useState('');
//   const [username, setUsername] = useState('');
//   const [isCallStarted, setIsCallStarted] = useState(false);

//   const startCall = async () => {
//     if (!roomId || !username) {
//       alert('Please enter both Room ID and Username');
//       return;
//     }

//     const appID = 1296094150; // Replace with your Zegocloud App ID
//     const serverSecret = '6ae0f42854031d2682da5d8286fac927'; // Replace with your server secret

//     const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
//       appID, 
//       serverSecret, 
//       roomId, 
//       Date.now().toString(), 
//       username
//     );

//     const zp = ZegoUIKitPrebuilt.create(kitToken);
    
//     zp.joinRoom({
//       container: document.getElementById('video-container'),
//       sharedLinks: [
//         {
//           name: 'Meeting link',
//           url: window.location.origin + `/meeting/${roomId}`
//         }
//       ],
//       scenario: {
//         mode: ZegoUIKitPrebuilt.GroupCall,
//       },
//       onLeaveRoom: () => {
//         setIsCallStarted(false);
//       }
//     });

//     setIsCallStarted(true);
//   };

//   return (
//     <Container maxWidth="sm">
//       <Paper 
//         elevation={3} 
//         sx={{ 
//           padding: 4, 
//           marginTop: 4, 
//           display: 'flex', 
//           flexDirection: 'column', 
//           alignItems: 'center' 
//         }}
//       >
//         {!isCallStarted ? (
//           <Box 
//             sx={{ 
//               display: 'flex', 
//               flexDirection: 'column', 
//               alignItems: 'center', 
//               width: '100%' 
//             }}
//           >
//             <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
//               <VideoCallIcon />
//             </Avatar>
//             <Typography component="h1" variant="h5">
//               Zegocloud Video Call
//             </Typography>
//             <Box sx={{ mt: 3, width: '100%' }}>
//               <TextField
//                 margin="normal"
//                 required
//                 fullWidth
//                 label="Room ID"
//                 value={roomId}
//                 onChange={(e) => setRoomId(e.target.value)}
//                 placeholder="Enter Room ID"
//               />
//               <TextField
//                 margin="normal"
//                 required
//                 fullWidth
//                 label="Username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 placeholder="Enter Your Name"
//               />
//               <Button
//                 type="submit"
//                 fullWidth
//                 variant="contained"
//                 sx={{ mt: 3, mb: 2 }}
//                 onClick={startCall}
//               >
//                 Start Video Call
//               </Button>
//             </Box>
//           </Box>
//         ) : null}
        
//         <div 
//           id="video-container" 
//           style={{ 
//             width: '100%', 
//             height: isCallStarted ? '500px' : '0px', 
//             transition: 'height 0.3s ease' 
//           }} 
//         />
//       </Paper>
//     </Container>
//   );
// };

// export default ZegocloudVideoCall;