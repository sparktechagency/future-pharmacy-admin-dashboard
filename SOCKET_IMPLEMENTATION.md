# Socket.IO Real-time Notifications Implementation

This document describes the Socket.IO implementation for real-time notifications in the Peterson Dashboard.

## Overview

The implementation provides real-time notification functionality using Socket.IO client, integrated with Redux for state management and React Context for connection management.

## Architecture

### 1. Socket Context (`src/contexts/SocketContext.tsx`)

- Manages Socket.IO connection lifecycle
- Handles authentication and reconnection logic
- Provides connection status to the application
- Auto-connects when user is authenticated

### 2. Notification Redux Slice (`src/redux/slices/notificationSlice.ts`)

- Manages notification state in Redux store
- Handles CRUD operations for notifications
- Tracks unread count and connection status
- Persists notifications in localStorage

### 3. Socket Notifications Hook (`src/hooks/useSocketNotifications.ts`)

- Custom hook for notification management
- Handles Socket.IO event listeners
- Provides methods for notification actions
- Integrates with Redux state

### 4. Updated Components

- **Header**: Shows real-time notification count and connection status
- **AllNotifications**: Displays real-time notifications with read/unread states
- **SocketTestComponent**: Test component for development and debugging

## Features

### Real-time Notifications

- ✅ Automatic connection when authenticated
- ✅ Real-time notification delivery via Socket.IO
- ✅ Unread count tracking
- ✅ Connection status indicator
- ✅ Auto-reconnection with exponential backoff
- ✅ Notification persistence
- ✅ HTTP API calls for read operations

### User Interface

- ✅ Notification badge in header
- ✅ Connection status indicator
- ✅ Mark as read functionality
- ✅ Mark all as read
- ✅ Visual distinction for unread notifications
- ✅ Empty state handling

### Error Handling

- ✅ Connection error handling
- ✅ Reconnection attempts with limits
- ✅ Graceful degradation when disconnected
- ✅ User feedback for connection issues

## Socket Events

### Client → Server

- `remove_notification` - Remove specific notification
- `get_notification_history` - Request notification history
- `test_notification` - Send test notification (for development)

### Server → Client

- `notification::${adminId}` - Personalized notification for specific admin (e.g., `notification::68c1139e98b0b42ebd93abe8`)
- `notification` - General notification (fallback)
- `notification_update` - Notification state update
- `notification_count` - Unread count update

## Configuration

### Socket URL

The Socket.IO client connects to the URL defined in `src/redux/baseUrl.ts`:

```typescript
export const socketUrl = "https://asif7001.binarybards.online";
```

### Authentication

The socket connection includes authentication headers:

```typescript
auth: {
  token: accessToken,
  userId: authId,
}
```

### Personalized Event Naming

The server sends notifications using personalized event names based on the admin ID:

```typescript
// Event name format: notification::${adminId}
// Example: notification::68c1139e98b0b42ebd93abe8

// Client listens for both personalized and general events
socket.on(`notification::${authId}`, handleNotification);
socket.on("notification", handleNotification); // fallback
```

### Hybrid Approach: Socket.IO + HTTP API

**Real-time notifications** are delivered via Socket.IO, while **read operations** use HTTP API calls:

```typescript
// Real-time notification delivery (Socket.IO)
socket.on(`notification::${adminId}`, (notificationData) => {
  // Add notification to state immediately
  dispatch(addNotification(notificationData));
});

// Read operations (HTTP API)
const markAsRead = async (notificationId: string) => {
  await readSingleNotification({ id: notificationId }).unwrap();
  dispatch(markAsRead(notificationId));
};

const markAllAsRead = async () => {
  await readAllNotifications({}).unwrap();
  dispatch(markAllAsRead());
};
```

**Benefits:**

- ✅ Real-time notification delivery via Socket.IO
- ✅ Reliable read operations via HTTP API
- ✅ Best of both worlds: real-time + reliable
- ✅ Consistent with existing API structure

## Usage

### Basic Usage

```typescript
import { useSocketNotifications } from "@/hooks/useSocketNotifications";

function MyComponent() {
  const { notifications, unreadCount, isConnected } = useSocketNotifications();

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
    </div>
  );
}
```

### Socket Context Usage

```typescript
import { useSocket } from "@/contexts/SocketContext";

function MyComponent() {
  const { socket, isConnected, connect, disconnect } = useSocket();

  // Use socket for custom events
  const sendCustomEvent = () => {
    if (socket && isConnected) {
      socket.emit("custom_event", { data: "example" });
    }
  };
}
```

## Testing

Use the `SocketTestComponent` for testing Socket.IO functionality:

```typescript
import { SocketTestComponent } from "@/components/notifications/SocketTestComponent";

// Add to any page for testing
<SocketTestComponent />;
```

## Server Requirements

The server should implement the following Socket.IO events:

1. **Authentication**: Verify JWT token on connection
2. **Notification Events**: Handle client notification requests
3. **Broadcasting**: Send notifications to specific users
4. **History**: Provide notification history on request

## Troubleshooting

### Common Issues

1. **Connection Failed**

   - Check if user is authenticated
   - Verify socket URL is correct
   - Check network connectivity

2. **Notifications Not Received**

   - Verify server is sending correct event names
   - Check authentication token validity
   - Ensure user ID matches server expectations

3. **Reconnection Issues**
   - Check max reconnection attempts (currently 5)
   - Verify exponential backoff timing
   - Check if authentication token is still valid

### Debug Mode

Enable debug logging by checking browser console for Socket.IO messages.

## Future Enhancements

- [ ] Notification categories/filtering
- [ ] Push notifications for background tabs
- [ ] Notification sound alerts
- [ ] Rich notification content (images, actions)
- [ ] Notification scheduling
- [ ] User preferences for notification types
