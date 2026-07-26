import assert from 'node:assert/strict';
import test from 'node:test';

import {
  deriveUsernameFromEmail,
  deriveUsernameFromName,
  getUserDisplayName,
  getUserHandle,
  isPlaceholderUsername,
} from '../src/lib/userDisplay.js';

const namedLegacyUser = {
  first_name: 'Prosper',
  last_name: 'Lekia',
  username: 'info8',
  email: 'info@connectize.co',
};

test('legacy info handles are rebuilt from the complete user name', () => {
  assert.equal(getUserHandle(namedLegacyUser), 'prosperlekia');
  assert.equal(deriveUsernameFromName(namedLegacyUser), 'prosperlekia');
});

test('all known info placeholder shapes are recognized', () => {
  for (const username of ['info', 'INFO2', 'info_3', 'info-4', 'info.5']) {
    assert.equal(isPlaceholderUsername(username), true);
  }
});

test('customized usernames remain unchanged', () => {
  assert.equal(
    getUserHandle({ ...namedLegacyUser, username: 'prosper.connects' }),
    'prosper.connects',
  );
});

test('an explicitly customized info handle remains unchanged', () => {
  assert.equal(
    getUserHandle({ ...namedLegacyUser, username: 'info', username_customized: true }),
    'info',
  );
});

test('a missing username is derived from the available full name', () => {
  assert.equal(getUserHandle({ full_name: 'Ada Lovelace' }), 'adalovelace');
});

test('generic mailbox addresses use the domain as their fallback handle', () => {
  assert.equal(deriveUsernameFromEmail('info@connectize.co'), 'connectize');
});

test('an info placeholder is never used as a display name', () => {
  assert.equal(getUserDisplayName({ username: 'info' }), 'User');
});
