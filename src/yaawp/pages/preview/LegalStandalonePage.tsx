// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
import React from 'react';
import { LegalView } from '../../components/legal/LegalView';

export const LegalStandalonePage: React.FC = () => {
  return <LegalView isStandalone={true} />;
};

export default LegalStandalonePage;
