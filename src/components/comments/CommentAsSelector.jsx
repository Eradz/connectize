import React from 'react';
import { Avatar, HStack, Text, RadioGroup, Radio, VStack, Box } from '@chakra-ui/react';
import { UserIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

/**
 * CommentAsSelector - Allows users to choose whether to comment as themselves or as a company
 * @param {Object} props
 * @param {Object} props.user - Current user object
 * @param {Array} props.userCompanies - Array of companies owned by the user
 * @param {string} props.selectedType - 'user' or 'company'
 * @param {number|null} props.selectedCompanyId - ID of selected company (if type is 'company')
 * @param {Function} props.onSelectionChange - Callback when selection changes: (type, companyId) => void
 */
export default function CommentAsSelector({ 
  user, 
  userCompanies = [], 
  selectedType = 'user',
  selectedCompanyId = null,
  onSelectionChange 
}) {
  // Don't show selector if user has no companies
  if (!userCompanies || userCompanies.length === 0) {
    return null;
  }

  const handleChange = (value) => {
    if (value === 'user') {
      onSelectionChange('user', null);
    } else {
      // value format: "company-{id}"
      const companyId = parseInt(value.split('-')[1]);
      onSelectionChange('company', companyId);
    }
  };

  const getCurrentValue = () => {
    if (selectedType === 'user') return 'user';
    return `company-${selectedCompanyId}`;
  };

  return (
    <Box mb={3} p={3} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
      <Text fontSize="sm" fontWeight="semibold" mb={2} color="gray.700">
        Comment as:
      </Text>
      
      <RadioGroup onChange={handleChange} value={getCurrentValue()}>
        <VStack align="stretch" spacing={2}>
          {/* Option 1: Comment as User */}
          <HStack
            as="label"
            htmlFor="comment-as-user"
            p={2}
            borderRadius="md"
            cursor="pointer"
            bg={selectedType === 'user' ? 'blue.50' : 'white'}
            border="1px solid"
            borderColor={selectedType === 'user' ? 'blue.300' : 'gray.200'}
            transition="all 0.2s"
            _hover={{ bg: selectedType === 'user' ? 'blue.100' : 'gray.50' }}
          >
            <Radio id="comment-as-user" value="user" colorScheme="blue" />
            <Avatar
              size="sm"
              name={`${user?.first_name} ${user?.last_name}`}
              src={user?.avatar}
            />
            <VStack align="start" spacing={0} flex={1}>
              <HStack spacing={1}>
                <Text fontSize="sm" fontWeight="medium">
                  {user?.first_name} {user?.last_name}
                </Text>
                <UserIcon className="w-3 h-3 text-blue-500" />
              </HStack>
              <Text fontSize="xs" color="gray.600">
                Personal account
              </Text>
            </VStack>
          </HStack>

          {/* Option 2+: Comment as Company */}
          {userCompanies.map((company) => (
            <HStack
              key={company.id}
              as="label"
              htmlFor={`comment-as-company-${company.id}`}
              p={2}
              borderRadius="md"
              cursor="pointer"
              bg={selectedType === 'company' && selectedCompanyId === company.id ? 'green.50' : 'white'}
              border="1px solid"
              borderColor={selectedType === 'company' && selectedCompanyId === company.id ? 'green.300' : 'gray.200'}
              transition="all 0.2s"
              _hover={{ bg: selectedType === 'company' && selectedCompanyId === company.id ? 'green.100' : 'gray.50' }}
            >
              <Radio 
                id={`comment-as-company-${company.id}`}
                value={`company-${company.id}`} 
                colorScheme="green" 
              />
              <Avatar
                size="sm"
                name={company.company_name}
                src={company.logo}
              />
              <VStack align="start" spacing={0} flex={1}>
                <HStack spacing={1}>
                  <Text fontSize="sm" fontWeight="medium">
                    {company.company_name}
                  </Text>
                  <BuildingOffice2Icon className="w-3 h-3 text-green-500" />
                  {company.verified && (
                    <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </HStack>
                <Text fontSize="xs" color="gray.600">
                  {company.tag_line || 'Company account'}
                </Text>
              </VStack>
            </HStack>
          ))}
        </VStack>
      </RadioGroup>
    </Box>
  );
}
