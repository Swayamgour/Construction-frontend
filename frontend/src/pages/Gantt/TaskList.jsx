// src/components/gantt/TaskList.jsx
import React from 'react';
import {
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Box,
    Typography,
    Chip,
    alpha
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    DragIndicator as DragIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const TaskList = ({
    tasks,
    onSelectTask,
    onEditTask,
    onDeleteTask,
    onDragEnd
}) => {
    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            'Planned': 'info',
            'In Progress': 'warning',
            'Completed': 'success',
            'Delayed': 'error',
            'On Hold': 'default'
        };
        return colors[status] || 'default';
    };

    // Calculate task depth for indentation
    const calculateDepth = (task, tasks, depth = 0) => {
        if (!task.parentTask) return depth;
        const parent = tasks.find(t => t._id === task.parentTask);
        return parent ? calculateDepth(parent, tasks, depth + 1) : depth;
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="task-list">
                {(provided) => (
                    <List
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        sx={{ width: '100%' }}
                    >
                        {tasks.map((task, index) => {
                            const depth = calculateDepth(task, tasks);

                            return (
                                <Draggable
                                    key={task._id}
                                    draggableId={task._id}
                                    index={index}
                                >
                                    {(provided, snapshot) => (
                                        <ListItem
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            sx={{
                                                borderBottom: 1,
                                                borderColor: 'divider',
                                                backgroundColor: snapshot.isDragging
                                                    ? alpha('#000', 0.05)
                                                    : 'inherit',
                                                pl: depth * 3 + 2,
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    backgroundColor: 'action.hover'
                                                }
                                            }}
                                            onClick={() => onSelectTask(task)}
                                        >
                                            {/* Drag Handle */}
                                            <Box
                                                {...provided.dragHandleProps}
                                                sx={{ mr: 1, display: 'flex', alignItems: 'center' }}
                                            >
                                                <DragIcon sx={{ color: 'action.active' }} />
                                            </Box>

                                            {/* Task Content */}
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body1" noWrap>
                                                            {task.name}
                                                        </Typography>
                                                        <Chip
                                                            label={task.status}
                                                            size="small"
                                                            color={getStatusColor(task.status)}
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                                                        </Typography>
                                                        <Typography variant="caption" color="primary">
                                                            {task.progress}%
                                                        </Typography>
                                                    </Box>
                                                }
                                            />

                                            {/* Actions */}
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditTask(task);
                                                    }}
                                                    sx={{ mr: 1 }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteTask(task._id);
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    )}
                                </Draggable>
                            );
                        })}
                        {provided.placeholder}
                    </List>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default TaskList;