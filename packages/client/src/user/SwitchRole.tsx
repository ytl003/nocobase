import { useCookieState } from 'ahooks';
import { Menu, Select } from 'antd';
import React from 'react';
import { useCurrentUserContext } from './CurrentUserProvider';

const useCurrentRoles = () => {
  const { data } = useCurrentUserContext();
  return data?.data?.roles || [];
};

export const SwitchRole = () => {
  const roles = useCurrentRoles();
  const [roleName, setRoleName] = useCookieState('currentRoleName', {
    defaultValue: roles?.find((role) => role.default)?.name,
  });
  if (roles.length <= 1) {
    return null;
  }
  return (
    <Menu.Item>
      切换角色{' '}
      <Select
        style={{ minWidth: 100 }}
        bordered={false}
        fieldNames={{
          label: 'title',
          value: 'name',
        }}
        options={roles}
        value={roleName}
        onChange={(roleName) => {
          setRoleName(roleName);
          window.location.reload();
        }}
      />
    </Menu.Item>
  );
};