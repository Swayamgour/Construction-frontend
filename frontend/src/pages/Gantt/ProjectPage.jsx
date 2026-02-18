// src/pages/ProjectPage.jsx
import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import GanttChart from './GanttChart';
// import GanttChart from '../components/gantt/GanttChart';

const ProjectPage = () => {
    // In a real app, this would come from router params
    const projectId = 'your-project-id-here';

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Project Timeline
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Drag and drop tasks to reschedule, resize to adjust duration
                </Typography>
            </Box>

            <Box sx={{ height: 'calc(100vh - 200px)' }}>
                <GanttChart projectId={projectId} />
            </Box>
        </Container>
    );
};

export default ProjectPage;