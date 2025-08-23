import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
} from '@chakra-ui/react';
import { FiSearch, FiMoreVertical, FiPlus, FiEdit, FiTrash2, FiEye, FiTruck, FiPackage } from 'react-icons/fi';
import logistics from '../../api-services/logistics';

const AdminLogisticsManagement = () => {
  const [shipmentRequests, setShipmentRequests] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [providers, setProviders] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [requestsData, shipmentsData, providersData, inventoryData] = await Promise.all([
        logistics.getShipmentRequests().catch(() => ({ results: [] })),
        logistics.getShipments().catch(() => ({ results: [] })),
        logistics.getLogisticsProviders().catch(() => ({ results: [] })),
        logistics.getInventoryItems().catch(() => ({ results: [] })),
      ]);

      setShipmentRequests(requestsData.results || []);
      setShipments(shipmentsData.results || []);
      setProviders(providersData.results || []);
      setInventoryItems(inventoryData.results || []);
    } catch (err) {
      setError('Failed to load logistics data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    try {
      if (type === 'request') {
        await logistics.deleteShipmentRequest(id);
      } else if (type === 'shipment') {
        await logistics.deleteShipment(id);
      } else if (type === 'provider') {
        await logistics.deleteLogisticsProvider(id);
      } else if (type === 'inventory') {
        await logistics.deleteInventoryItem(id);
      }
      
      toast({
        title: `${type} deleted successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadData(); // Reload data
    } catch (err) {
      toast({
        title: `Failed to delete ${type}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'yellow',
      approved: 'green',
      rejected: 'red',
      in_transit: 'blue',
      delivered: 'green',
      cancelled: 'gray',
      active: 'green',
      inactive: 'gray',
    };
    return (
      <Badge colorScheme={statusColors[status] || 'gray'}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ') : 'Unknown'}
      </Badge>
    );
  };

  const filteredRequests = shipmentRequests.filter(request =>
    request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredShipments = shipments.filter(shipment =>
    shipment.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProviders = providers.filter(provider =>
    provider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInventory = inventoryItems.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Spinner size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Logistics Management</Heading>
            <Text color="gray.600">
              Manage shipment requests, active shipments, providers, and inventory
            </Text>
          </VStack>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
            Create New
          </Button>
        </HStack>

        {/* Search */}
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <FiSearch />
          </InputLeftElement>
          <Input
            placeholder="Search logistics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Shipment Requests ({shipmentRequests.length})</Tab>
            <Tab>Active Shipments ({shipments.length})</Tab>
            <Tab>Providers ({providers.length})</Tab>
            <Tab>Inventory ({inventoryItems.length})</Tab>
          </TabList>

          <TabPanels>
            {/* Shipment Requests Tab */}
            <TabPanel>
              <Box overflowX="auto">
                <Table variant="simple" className="min-w-full w-full table-auto">
                  <Thead>
                    <Tr>
                      <Th>Request Details</Th>
                      <Th>Route</Th>
                      <Th>Status</Th>
                      <Th>Created</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredRequests.length === 0 ? (
                      <Tr>
                        <Td colSpan={5} textAlign="center" py={8}>
                          <Text color="gray.500">No shipment requests found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      filteredRequests.map((request) => (
                        <Tr key={request.id}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">{request.title || `Request #${request.id}`}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {request.description || 'No description available'}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm">From: {request.origin || 'Unknown'}</Text>
                              <Text fontSize="sm">To: {request.destination || 'Unknown'}</Text>
                            </VStack>
                          </Td>
                          <Td>{getStatusBadge(request.status)}</Td>
                          <Td>
                            {request.created_at
                              ? new Date(request.created_at).toLocaleDateString()
                              : 'Unknown'}
                          </Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={Button}
                                variant="ghost"
                                size="sm"
                                icon={<FiMoreVertical />}
                              >
                                <FiMoreVertical />
                              </MenuButton>
                              <MenuList>
                                <MenuItem icon={<FiEye />}>View Details</MenuItem>
                                <MenuItem icon={<FiEdit />}>Edit</MenuItem>
                                <MenuItem
                                  icon={<FiTrash2 />}
                                  color="red.500"
                                  onClick={() => handleDelete(request.id, 'request')}
                                >
                                  Delete
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Active Shipments Tab */}
            <TabPanel>
              <Box overflowX="auto">
                <Table variant="simple" className="min-w-full w-full table-auto">
                  <Thead>
                    <Tr>
                      <Th>Tracking Number</Th>
                      <Th>Route</Th>
                      <Th>Status</Th>
                      <Th>Provider</Th>
                      <Th>Created</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredShipments.length === 0 ? (
                      <Tr>
                        <Td colSpan={6} textAlign="center" py={8}>
                          <Text color="gray.500">No active shipments found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      filteredShipments.map((shipment) => (
                        <Tr key={shipment.id}>
                          <Td>
                            <HStack>
                              <FiTruck />
                              <Text fontWeight="medium">
                                {shipment.tracking_number || `Ship #${shipment.id}`}
                              </Text>
                            </HStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm">From: {shipment.origin || 'Unknown'}</Text>
                              <Text fontSize="sm">To: {shipment.destination || 'Unknown'}</Text>
                            </VStack>
                          </Td>
                          <Td>{getStatusBadge(shipment.status)}</Td>
                          <Td>{shipment.provider || 'Unknown'}</Td>
                          <Td>
                            {shipment.created_at
                              ? new Date(shipment.created_at).toLocaleDateString()
                              : 'Unknown'}
                          </Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={Button}
                                variant="ghost"
                                size="sm"
                                icon={<FiMoreVertical />}
                              >
                                <FiMoreVertical />
                              </MenuButton>
                              <MenuList>
                                <MenuItem icon={<FiEye />}>Track Shipment</MenuItem>
                                <MenuItem icon={<FiEdit />}>Update Status</MenuItem>
                                <MenuItem
                                  icon={<FiTrash2 />}
                                  color="red.500"
                                  onClick={() => handleDelete(shipment.id, 'shipment')}
                                >
                                  Cancel Shipment
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Providers Tab */}
            <TabPanel>
              <Box overflowX="auto">
                <Table variant="simple" className="min-w-full w-full table-auto">
                  <Thead>
                    <Tr>
                      <Th>Provider</Th>
                      <Th>Service Type</Th>
                      <Th>Status</Th>
                      <Th>Rating</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredProviders.length === 0 ? (
                      <Tr>
                        <Td colSpan={5} textAlign="center" py={8}>
                          <Text color="gray.500">No logistics providers found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      filteredProviders.map((provider) => (
                        <Tr key={provider.id}>
                          <Td>
                            <HStack>
                              <Avatar size="sm" name={provider.name} />
                              <Text fontWeight="medium">{provider.name || 'Unknown Provider'}</Text>
                            </HStack>
                          </Td>
                          <Td>{provider.service_type || 'General'}</Td>
                          <Td>{getStatusBadge(provider.status)}</Td>
                          <Td>{provider.rating || 'N/A'}</Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={Button}
                                variant="ghost"
                                size="sm"
                                icon={<FiMoreVertical />}
                              >
                                <FiMoreVertical />
                              </MenuButton>
                              <MenuList>
                                <MenuItem icon={<FiEye />}>View Details</MenuItem>
                                <MenuItem icon={<FiEdit />}>Edit</MenuItem>
                                <MenuItem
                                  icon={<FiTrash2 />}
                                  color="red.500"
                                  onClick={() => handleDelete(provider.id, 'provider')}
                                >
                                  Remove Provider
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Inventory Tab */}
            <TabPanel>
              <Box overflowX="auto">
                <Table variant="simple" className="min-w-full w-full table-auto">
                  <Thead>
                    <Tr>
                      <Th>Item</Th>
                      <Th>SKU</Th>
                      <Th>Category</Th>
                      <Th>Quantity</Th>
                      <Th>Location</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredInventory.length === 0 ? (
                      <Tr>
                        <Td colSpan={6} textAlign="center" py={8}>
                          <Text color="gray.500">No inventory items found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      filteredInventory.map((item) => (
                        <Tr key={item.id}>
                          <Td>
                            <HStack>
                              <FiPackage />
                              <Text fontWeight="medium">{item.name || 'Unknown Item'}</Text>
                            </HStack>
                          </Td>
                          <Td>{item.sku || 'N/A'}</Td>
                          <Td>{item.category || 'Uncategorized'}</Td>
                          <Td>{item.quantity || 0}</Td>
                          <Td>{item.location || 'Unknown'}</Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={Button}
                                variant="ghost"
                                size="sm"
                                icon={<FiMoreVertical />}
                              >
                                <FiMoreVertical />
                              </MenuButton>
                              <MenuList>
                                <MenuItem icon={<FiEye />}>View Details</MenuItem>
                                <MenuItem icon={<FiEdit />}>Edit</MenuItem>
                                <MenuItem
                                  icon={<FiTrash2 />}
                                  color="red.500"
                                  onClick={() => handleDelete(item.id, 'inventory')}
                                >
                                  Remove Item
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Create Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select placeholder="Select type">
                  <option value="request">Shipment Request</option>
                  <option value="provider">Logistics Provider</option>
                  <option value="inventory">Inventory Item</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Name/Title</FormLabel>
                <Input placeholder="Enter name or title" />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea placeholder="Enter description" rows={4} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={onClose}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminLogisticsManagement;