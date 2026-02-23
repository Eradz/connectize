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
  Switch,
} from '@chakra-ui/react';
import { FiSearch, FiMoreVertical, FiPlus, FiEdit, FiTrash2, FiEye, FiCheck, FiX } from 'react-icons/fi';
import knowledgeHub from '../../api-services/knowledgeHub';

const AdminKnowledge = () => {
  const [articles, setArticles] = useState([]);
  const [forums, setForums] = useState([]);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [articleTypes, setArticleTypes] = useState([]);

  // Fetch admin-managed article types
  useEffect(() => {
    const fetchArticleTypes = async () => {
      try {
        const res = await knowledgeHub.getArticleTypes();
        const data = res?.data || res;
        const types = Array.isArray(data) ? data : data?.results || [];
        setArticleTypes(types.map(t => ({ value: t.name, label: t.display_name })));
      } catch (err) {
        console.error('Failed to fetch article types:', err);
        setArticleTypes([
          { value: 'article', label: 'Article' },
          { value: 'forum', label: 'Forum Discussion' }
        ]);
      }
    };
    fetchArticleTypes();
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const toast = useToast();

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [articlesData, forumsData, moderationData] = await Promise.all([
        knowledgeHub.getArticles(),
        knowledgeHub.getForums(),
        knowledgeHub.getModerationQueue(),
      ]);

      setArticles(articlesData.results || []);
      setForums(forumsData.results || []);
      setModerationQueue(moderationData.results || []);
    } catch (err) {
      setError('Failed to load knowledge hub data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, type) => {
    try {
      await knowledgeHub.approveContent(id, type);
      toast({
        title: 'Content approved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadData(); // Reload data
    } catch (err) {
      toast({
        title: 'Failed to approve content',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleReject = async (id, type) => {
    try {
      await knowledgeHub.rejectContent(id, type);
      toast({
        title: 'Content rejected',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadData(); // Reload data
    } catch (err) {
      toast({
        title: 'Failed to reject content',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id, type) => {
    try {
      if (type === 'article') {
        await knowledgeHub.deleteArticle(id);
      } else if (type === 'forum') {
        await knowledgeHub.deleteForum(id);
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

  const handlePublish = async (id) => {
    try {
      await knowledgeHub.publishArticle(id);
      toast({
        title: 'Article published successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadData(); // Reload data
    } catch (err) {
      toast({
        title: 'Failed to publish article',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      draft: 'gray',
      published: 'green',
      pending: 'yellow',
      approved: 'green',
      rejected: 'red',
    };
    return (
      <Badge colorScheme={statusColors[status] || 'gray'}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </Badge>
    );
  };

  const filteredArticles = articles.filter(article =>
    article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredForums = forums.filter(forum =>
    forum.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    forum.created_by?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredModerationQueue = moderationQueue.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.author?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Heading size="lg">Knowledge Hub Management</Heading>
            <Text color="gray.600">
              Manage articles, forums, and content moderation
            </Text>
          </VStack>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
            Create Content
          </Button>
        </HStack>

        {/* Search */}
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <FiSearch />
          </InputLeftElement>
          <Input
            placeholder="Search knowledge content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Articles ({articles.length})</Tab>
            <Tab>Forums ({forums.length})</Tab>
            <Tab>Moderation Queue ({moderationQueue.length})</Tab>
          </TabList>

          <TabPanels>
            {/* Articles Tab */}
            <TabPanel>
              <Box overflowX="auto">
                <Table variant="simple" className="min-w-full w-full table-auto">
                  <Thead>
                    <Tr>
                      <Th>Title</Th>
                      <Th>Author</Th>
                      <Th>Category</Th>
                      <Th>Status</Th>
                      <Th>Views</Th>
                      <Th>Created</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredArticles.length === 0 ? (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py={8}>
                          <Text color="gray.500">No articles found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      filteredArticles.map((article) => (
                        <Tr key={article.id}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">{article.title}</Text>
                              <Text fontSize="sm" color="gray.500" noOfLines={1}>
                                {article.excerpt || 'No excerpt available'}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <HStack>
                              <Avatar size="sm" name={article.author} />
                              <Text>{article.author || 'Unknown'}</Text>
                            </HStack>
                          </Td>
                          <Td>{article.category || 'Uncategorized'}</Td>
                          <Td>{getStatusBadge(article.status)}</Td>
                          <Td>{article.views || 0}</Td>
                          <Td>
                            {article.created_at
                              ? new Date(article.created_at).toLocaleDateString()
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
                                <MenuItem icon={<FiEye />}>View</MenuItem>
                                <MenuItem icon={<FiEdit />}>Edit</MenuItem>
                                {article.status === 'draft' && (
                                  <MenuItem
                                    icon={<FiCheck />}
                                    onClick={() => handlePublish(article.id)}
                                  >
                                    Publish
                                  </MenuItem>
                                )}
                                <MenuItem
                                  icon={<FiTrash2 />}
                                  color="red.500"
                                  onClick={() => handleDelete(article.id, 'article')}
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

            {/* Forums Tab */}
            <TabPanel>
              <Box overflowX="auto">
                <Table variant="simple" className="min-w-full w-full table-auto">
                  <Thead>
                    <Tr>
                      <Th>Title</Th>
                      <Th>Created By</Th>
                      <Th>Category</Th>
                      <Th>Replies</Th>
                      <Th>Status</Th>
                      <Th>Created</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredForums.length === 0 ? (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py={8}>
                          <Text color="gray.500">No forum discussions found</Text>
                        </Td>
                      </Tr>
                    ) : (
                      filteredForums.map((forum) => (
                        <Tr key={forum.id}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">{forum.title}</Text>
                              <Text fontSize="sm" color="gray.500" noOfLines={1}>
                                {forum.description || 'No description available'}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <HStack>
                              <Avatar size="sm" name={forum.created_by} />
                              <Text>{forum.created_by || 'Unknown'}</Text>
                            </HStack>
                          </Td>
                          <Td>{forum.category || 'General'}</Td>
                          <Td>{forum.replies_count || 0}</Td>
                          <Td>{getStatusBadge(forum.status)}</Td>
                          <Td>
                            {forum.created_at
                              ? new Date(forum.created_at).toLocaleDateString()
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
                                <MenuItem icon={<FiEye />}>View</MenuItem>
                                <MenuItem icon={<FiEdit />}>Edit</MenuItem>
                                <MenuItem
                                  icon={<FiTrash2 />}
                                  color="red.500"
                                  onClick={() => handleDelete(forum.id, 'forum')}
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

            {/* Moderation Queue Tab */}
            <TabPanel>
              <Box overflowX="auto">
                <Table variant="simple" className="min-w-full w-full table-auto">
                  <Thead>
                    <Tr>
                      <Th>Content</Th>
                      <Th>Type</Th>
                      <Th>Author</Th>
                      <Th>Status</Th>
                      <Th>Submitted</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredModerationQueue.length === 0 ? (
                      <Tr>
                        <Td colSpan={6} textAlign="center" py={8}>
                          <Text color="gray.500">No items in moderation queue</Text>
                        </Td>
                      </Tr>
                    ) : (
                      filteredModerationQueue.map((item) => (
                        <Tr key={item.id}>
                          <Td>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">{item.title}</Text>
                              <Text fontSize="sm" color="gray.500" noOfLines={2}>
                                {item.content || 'No content preview available'}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge>{item.content_type || 'Unknown'}</Badge>
                          </Td>
                          <Td>
                            <HStack>
                              <Avatar size="sm" name={item.author} />
                              <Text>{item.author || 'Unknown'}</Text>
                            </HStack>
                          </Td>
                          <Td>{getStatusBadge(item.status)}</Td>
                          <Td>
                            {item.submitted_at
                              ? new Date(item.submitted_at).toLocaleDateString()
                              : 'Unknown'}
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                colorScheme="green"
                                variant="ghost"
                                onClick={() => handleApprove(item.id, item.content_type)}
                              >
                                <FiCheck />
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleReject(item.id, item.content_type)}
                              >
                                <FiX />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <FiEye />
                              </Button>
                            </HStack>
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

      {/* Create Content Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Content</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Content Type</FormLabel>
                <Select placeholder="Select content type">
                  {articleTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input placeholder="Enter content title" />
              </FormControl>
              <FormControl>
                <FormLabel>Content</FormLabel>
                <Textarea placeholder="Enter content body" rows={6} />
              </FormControl>
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select placeholder="Select category">
                  <option value="technical">Technical</option>
                  <option value="business">Business</option>
                  <option value="general">General</option>
                </Select>
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Publish immediately</FormLabel>
                <Switch />
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

export default AdminKnowledge;
