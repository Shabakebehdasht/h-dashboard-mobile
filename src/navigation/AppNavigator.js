import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import TicketsScreen from '../screens/TicketsScreen';
import TicketDetailScreen from '../screens/TicketDetailScreen';
import CreateTicketScreen from '../screens/CreateTicketScreen';
import TodosScreen from '../screens/TodosScreen';
import CreateTodoScreen from '../screens/CreateTodoScreen';
import UnitsScreen from '../screens/UnitsScreen';
import UnitDetailScreen from '../screens/UnitDetailScreen';
import HardwareScreen from '../screens/HardwareScreen';
import HardwareDetailScreen from '../screens/HardwareDetailScreen';
import HardwareFormScreen from '../screens/HardwareFormScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AiChatScreen from '../screens/AiChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({ icon, label, focused }) => (
  <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.5 }}>
    {icon}
  </Text>
);

function TicketsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1e293b' }, headerTintColor: '#f1f5f9' }}>
      <Stack.Screen name="TicketsList" component={TicketsScreen} options={{ title: '📋 تیکت‌ها' }} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ title: 'جزئیات تیکت' }} />
      <Stack.Screen name="CreateTicket" component={CreateTicketScreen} options={{ title: 'تیکت جدید' }} />
    </Stack.Navigator>
  );
}

function TodosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1e293b' }, headerTintColor: '#f1f5f9' }}>
      <Stack.Screen name="TodosList" component={TodosScreen} options={{ title: '✅ تسک‌ها' }} />
      <Stack.Screen name="CreateTodo" component={CreateTodoScreen} options={{ title: 'تسک جدید' }} />
    </Stack.Navigator>
  );
}

function HardwareStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1e293b' }, headerTintColor: '#f1f5f9' }}>
      <Stack.Screen name="HardwareList" component={HardwareScreen} options={{ title: '🖥️ سخت‌افزار' }} />
      <Stack.Screen name="HardwareDetail" component={HardwareDetailScreen} options={{ title: 'جزئیات سخت‌افزار' }} />
      <Stack.Screen name="HardwareForm" component={HardwareFormScreen} options={{ title: 'فرم سخت‌افزار' }} />
    </Stack.Navigator>
  );
}

function UnitsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1e293b' }, headerTintColor: '#f1f5f9' }}>
      <Stack.Screen name="UnitsList" component={UnitsScreen} options={{ title: '🏢 واحدها' }} />
      <Stack.Screen name="UnitDetail" component={UnitDetailScreen} options={{ title: 'جزئیات واحد' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#1e293b',
            borderTopColor: '#334155',
            paddingBottom: 6,
            paddingTop: 6,
            height: 58,
          },
          tabBarActiveTintColor: '#7c3aed',
          tabBarInactiveTintColor: '#64748b',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tab.Screen
          name="DashboardTab"
          component={DashboardScreen}
          options={{
            title: 'خانه',
            tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="HardwareTab"
          component={HardwareStack}
          options={{
            title: 'سخت‌افزار',
            tabBarIcon: ({ focused }) => <TabIcon icon="🖥️" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="CalendarTab"
          component={CalendarScreen}
          options={{
            title: 'تقویم',
            tabBarIcon: ({ focused }) => <TabIcon icon="📅" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="AiChatTab"
          component={AiChatScreen}
          options={{
            title: 'چت AI',
            headerShown: true,
            headerStyle: { backgroundColor: '#1e293b' },
            headerTintColor: '#f1f5f9',
            headerTitle: '🤖 چت هوش مصنوعی',
            tabBarIcon: ({ focused }) => <TabIcon icon="🤖" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="TicketsTab"
          component={TicketsStack}
          options={{
            title: 'تیکت‌ها',
            tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="TodosTab"
          component={TodosStack}
          options={{
            title: 'تسک‌ها',
            tabBarIcon: ({ focused }) => <TabIcon icon="✅" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="UnitsTab"
          component={UnitsStack}
          options={{
            title: 'واحدها',
            tabBarIcon: ({ focused }) => <TabIcon icon="🏢" focused={focused} />,
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            title: 'پروفایل',
            headerShown: true,
            headerStyle: { backgroundColor: '#1e293b' },
            headerTintColor: '#f1f5f9',
            headerTitle: '👤 پروفایل',
            tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}