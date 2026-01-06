import React from 'react';
import styles from './LoadingSkeleton.module.css';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className={styles.skeletonContainer}>
      {[1, 2, 3].map((index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.skeletonHeader}>
            <div className={styles.skeletonRank} />
            <div className={styles.skeletonName} />
          </div>
          <div className={styles.skeletonScore} />
          <div className={styles.skeletonReasons}>
            <div className={styles.skeletonReason} />
            <div className={styles.skeletonReason} />
            <div className={styles.skeletonReason} />
          </div>
          <div className={styles.skeletonDetails}>
            <div className={styles.skeletonTag} />
            <div className={styles.skeletonTag} />
            <div className={styles.skeletonTag} />
          </div>
        </div>
      ))}
    </div>
  );
};

