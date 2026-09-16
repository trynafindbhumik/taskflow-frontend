'use client';

import { ChevronLeft, ChevronDown, ChevronUp, Users, Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button/Button';
import type { Project, User } from '@/utils/types';

import styles from '../ProjectDetails.module.css';

interface ProjectHeaderProps {
  project: Project | null;
  members: User[];
  descExpanded: boolean;
  onToggleDesc: () => void;
  onOpenMembers: () => void;
  onOpenCreateTask: () => void;
  maxDescLength?: number;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  members,
  descExpanded,
  onToggleDesc,
  onOpenMembers,
  onOpenCreateTask,
  maxDescLength = 180,
}) => {
  if (!project) return null;

  const desc = project.description ?? '';
  const isLongDesc = desc.length > maxDescLength;
  const displayedDesc = descExpanded || !isLongDesc ? desc : `${desc.slice(0, maxDescLength)}…`;

  return (
    <div>
      <Link href="/projects" className={styles.backBtn}>
        <ChevronLeft size={16} />
        Back to Projects
      </Link>

      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{project.name}</h1>
          {desc && (
            <div className={styles.descriptionWrap}>
              <p className={styles.subtitle}>
                {displayedDesc}
                {isLongDesc && (
                  <>
                    {' '}
                    <button type="button" className={styles.descToggle} onClick={onToggleDesc}>
                      {descExpanded ? (
                        <>
                          Show less <ChevronUp size={12} />
                        </>
                      ) : (
                        <>
                          Read more <ChevronDown size={12} />
                        </>
                      )}
                    </button>
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={onOpenMembers} leftIcon={<Users size={16} />}>
            Members ({members.length})
          </Button>

          <Button variant="primary" onClick={onOpenCreateTask} leftIcon={<Plus size={16} />}>
            Add Task
          </Button>
        </div>
      </div>
    </div>
  );
};
