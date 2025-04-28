import React from 'react';
import { render } from '@testing-library/react';
import PropertyPanel from './PropertyPanel';

describe('PropertyPanel Component', () => {
  it('renders without crashing', () => {
    render(<PropertyPanel />);
  });
}); 