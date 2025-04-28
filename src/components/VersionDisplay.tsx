import React, { FC } from 'react';

const VersionDisplay: FC = () => {
  const version = '1.0.12';
  const timestamp = new Date().toISOString();

  return (
    <div className="fixed bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
      v{version} ({timestamp})
    </div>
  );
};

export default VersionDisplay; 