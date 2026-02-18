// src/components/gantt/GanttTimeline.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    LinearProgress,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    Today as TodayIcon
} from '@mui/icons-material';
import {
    addMonths,
    addDays,
    format,
    differenceInDays,
    eachDayOfInterval,
    eachMonthOfInterval,
    isWithinInterval,
    startOfDay,
    endOfDay
} from 'date-fns';

const GanttTimeline = ({
    tasks,
    timelineConfig,
    onTaskClick,
    onTaskUpdate,
    containerRef
}) => {
    const [scale, setScale] = useState(20); // pixels per day
    const [currentDate, setCurrentDate] = useState(new Date());
    const [dragState, setDragState] = useState(null);
    const [resizeState, setResizeState] = useState(null);

    // Calculate timeline boundaries
    const {
        viewStartDate,
        viewEndDate,
        visibleDays,
        monthHeaders
    } = useMemo(() => {
        const start = timelineConfig.startDate || new Date();
        const end = timelineConfig.endDate || addMonths(start, 3);

        const days = eachDayOfInterval({ start, end });
        const months = eachMonthOfInterval({ start, end });

        return {
            viewStartDate: start,
            viewEndDate: end,
            visibleDays: days,
            monthHeaders: months.map(month => ({
                date: month,
                label: format(month, 'MMM yyyy'),
                width: differenceInDays(
                    month.getMonth() === 11
                        ? new Date(month.getFullYear() + 1, 0, 1)
                        : new Date(month.getFullYear(), month.getMonth() + 1, 1),
                    month
                ) * scale
            }))
        };
    }, [timelineConfig, scale]);

    // Calculate task bar position and width
    const getTaskPosition = (task) => {
        const start = new Date(task.startDate);
        const end = new Date(task.endDate);

        const daysFromStart = differenceInDays(start, viewStartDate);
        const duration = differenceInDays(end, start) + 1; // Inclusive

        return {
            left: daysFromStart * scale,
            width: duration * scale,
            daysFromStart,
            duration
        };
    };

    // Handle task bar drag
    const handleTaskDragStart = (task, clientX) => {
        const position = getTaskPosition(task);
        setDragState({
            taskId: task._id,
            startX: clientX,
            originalLeft: position.left,
            originalDaysFromStart: position.daysFromStart
        });
    };

    const handleTaskDragMove = (clientX) => {
        if (!dragState) return;

        const deltaX = clientX - dragState.startX;
        const deltaDays = Math.round(deltaX / scale);
        const newDaysFromStart = dragState.originalDaysFromStart + deltaDays;

        // Update task visual position
        return newDaysFromStart;
    };

    const handleTaskDragEnd = async (newDaysFromStart) => {
        if (!dragState) return;

        const task = tasks.find(t => t._id === dragState.taskId);
        if (!task) return;

        const newStartDate = addDays(viewStartDate, newDaysFromStart);
        const duration = differenceInDays(
            new Date(task.endDate),
            new Date(task.startDate)
        );
        const newEndDate = addDays(newStartDate, duration);

        try {
            await onTaskUpdate(task._id, {
                startDate: newStartDate,
                endDate: newEndDate
            });
        } catch (err) {
            console.error('Failed to update task dates:', err);
        }

        setDragState(null);
    };

    // Handle task resize
    const handleResizeStart = (task, side, clientX) => {
        const position = getTaskPosition(task);
        setResizeState({
            taskId: task._id,
            side,
            startX: clientX,
            originalWidth: position.width,
            originalDuration: position.duration,
            originalDaysFromStart: position.daysFromStart
        });
    };

    const handleResizeMove = (clientX) => {
        if (!resizeState) return;

        const deltaX = clientX - resizeState.startX;
        const deltaDays = Math.round(deltaX / scale);

        let newDuration = resizeState.originalDuration;
        let newDaysFromStart = resizeState.originalDaysFromStart;

        if (resizeState.side === 'right') {
            newDuration = Math.max(1, resizeState.originalDuration + deltaDays);
        } else if (resizeState.side === 'left') {
            newDuration = Math.max(1, resizeState.originalDuration - deltaDays);
            newDaysFromStart = resizeState.originalDaysFromStart + deltaDays;
        }

        return { newDuration, newDaysFromStart };
    };

    const handleResizeEnd = async (newDuration, newDaysFromStart) => {
        if (!resizeState) return;

        const task = tasks.find(t => t._id === resizeState.taskId);
        if (!task) return;

        const newStartDate = addDays(viewStartDate, newDaysFromStart);
        const newEndDate = addDays(newStartDate, newDuration - 1); // -1 because inclusive

        try {
            await onTaskUpdate(task._id, {
                startDate: newStartDate,
                endDate: newEndDate
            });
        } catch (err) {
            console.error('Failed to resize task:', err);
        }

        setResizeState(null);
    };

    // Mouse event handlers
    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        const handleMouseMove = (e) => {
            if (dragState) {
                const newDaysFromStart = handleTaskDragMove(e.clientX);
                // Visual feedback could be added here
            }

            if (resizeState) {
                const result = handleResizeMove(e.clientX);
                // Visual feedback could be added here
            }
        };

        const handleMouseUp = () => {
            if (dragState) {
                // For now, we'll just cancel the drag
                // In a real implementation, you'd save the final position
                setDragState(null);
            }

            if (resizeState) {
                setResizeState(null);
            }
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('mouseleave', handleMouseUp);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseup', handleMouseUp);
            container.removeEventListener('mouseleave', handleMouseUp);
        };
    }, [dragState, resizeState, containerRef]);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Timeline Header */}
            <Paper
                elevation={1}
                sx={{
                    p: 1,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Zoom In">
                        <IconButton
                            size="small"
                            onClick={() => setScale(s => Math.min(s + 5, 100))}
                        >
                            <ZoomInIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Zoom Out">
                        <IconButton
                            size="small"
                            onClick={() => setScale(s => Math.max(s - 5, 5))}
                        >
                            <ZoomOutIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Today">
                        <IconButton
                            size="small"
                            onClick={() => setCurrentDate(new Date())}
                        >
                            <TodayIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Typography variant="caption" color="text.secondary">
                    {format(viewStartDate, 'MMM d, yyyy')} - {format(viewEndDate, 'MMM d, yyyy')}
                </Typography>
            </Paper>

            {/* Month Headers */}
            <Box sx={{
                display: 'flex',
                borderBottom: 1,
                borderColor: 'divider',
                backgroundColor: 'background.default'
            }}>
                {monthHeaders.map((month, index) => (
                    <Box
                        key={index}
                        sx={{
                            width: month.width,
                            minWidth: month.width,
                            p: 1,
                            borderRight: 1,
                            borderColor: 'divider',
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="subtitle2">
                            {month.label}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Day Headers */}
            <Box sx={{
                display: 'flex',
                borderBottom: 1,
                borderColor: 'divider',
                backgroundColor: 'background.paper'
            }}>
                {visibleDays.map((day, index) => (
                    <Box
                        key={index}
                        sx={{
                            width: scale,
                            minWidth: scale,
                            p: 0.5,
                            borderRight: 1,
                            borderColor: 'divider',
                            textAlign: 'center',
                            backgroundColor: format(day, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
                                ? 'primary.light'
                                : 'inherit'
                        }}
                    >
                        <Typography variant="caption">
                            {format(day, 'd')}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                            {format(day, 'EEE')}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Tasks Area */}
            <Box sx={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                {/* Grid Lines */}
                {visibleDays.map((day, index) => (
                    <Box
                        key={`line-${index}`}
                        sx={{
                            position: 'absolute',
                            left: index * scale,
                            top: 0,
                            bottom: 0,
                            width: 1,
                            backgroundColor: index % 7 === 0 ? 'divider' : 'action.hover',
                            zIndex: 1
                        }}
                    />
                ))}

                {/* Task Bars */}
                {tasks.map((task, index) => {
                    const position = getTaskPosition(task);

                    return (
                        <Tooltip
                            key={task._id}
                            title={`${task.name} (${task.progress}%)`}
                            placement="top"
                            arrow
                        >
                            <Box
                                onClick={() => onTaskClick(task)}
                                sx={{
                                    position: 'absolute',
                                    left: position.left,
                                    top: index * 50 + 10,
                                    width: position.width,
                                    height: 30,
                                    backgroundColor: task.status === 'Completed'
                                        ? 'success.light'
                                        : task.status === 'In Progress'
                                            ? 'warning.light'
                                            : 'primary.light',
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        opacity: 0.9,
                                        boxShadow: 2
                                    }
                                }}
                            >
                                {/* Progress Bar inside task */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: `${task.progress}%`,
                                        height: '100%',
                                        backgroundColor: task.status === 'Completed'
                                            ? 'success.main'
                                            : task.status === 'In Progress'
                                                ? 'warning.main'
                                                : 'primary.main',
                                        opacity: 0.6
                                    }}
                                />

                                {/* Task Name */}
                                <Typography
                                    variant="caption"
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: 8,
                                        transform: 'translateY(-50%)',
                                        color: 'common.white',
                                        fontWeight: 'medium',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: 'calc(100% - 16px)'
                                    }}
                                >
                                    {task.name}
                                </Typography>

                                {/* Resize Handles */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: 4,
                                        cursor: 'col-resize',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.5)'
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        handleResizeStart(task, 'left', e.clientX);
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: 4,
                                        cursor: 'col-resize',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.5)'
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        handleResizeStart(task, 'right', e.clientX);
                                    }}
                                />
                            </Box>
                        </Tooltip>
                    );
                })}

                {/* Dependency Lines */}
                {tasks.map(task => {
                    if (!task.dependencies || task.dependencies.length === 0) return null;

                    return task.dependencies.map(depId => {
                        const dependentTask = tasks.find(t => t._id === depId);
                        if (!dependentTask) return null;

                        const taskPos = getTaskPosition(task);
                        const depPos = getTaskPosition(dependentTask);

                        return (
                            <svg
                                key={`${task._id}-${depId}`}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    pointerEvents: 'none',
                                    zIndex: 0
                                }}
                            >
                                <line
                                    x1={depPos.left + depPos.width}
                                    y1={tasks.findIndex(t => t._id === dependentTask._id) * 50 + 25}
                                    x2={taskPos.left}
                                    y2={tasks.findIndex(t => t._id === task._id) * 50 + 25}
                                    stroke="#ff6b6b"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                    markerEnd="url(#arrowhead)"
                                />

                                <defs>
                                    <marker
                                        id="arrowhead"
                                        markerWidth="10"
                                        markerHeight="7"
                                        refX="9"
                                        refY="3.5"
                                        orient="auto"
                                    >
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#ff6b6b" />
                                    </marker>
                                </defs>
                            </svg>
                        );
                    });
                })}
            </Box>
        </Box>
    );
};

export default GanttTimeline;