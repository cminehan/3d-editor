import React from 'react';
import { render } from '@testing-library/react';
import Toolbar from './Toolbar';

describe('Toolbar Component', () => {
  it('renders without crashing', () => {
    render(<Toolbar />);
  });
}); 