import React from 'react';
import { render } from '@testing-library/react';
import Scene from './Scene';

describe('Scene Component', () => {
  it('renders without crashing', () => {
    render(<Scene />);
  });
});