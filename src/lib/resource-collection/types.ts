/**
 * Resource Collection Types
 *
 * TypeScript interfaces for resource collection system
 */

export interface ResourceProgress {
	resourceType: string;
	name?: string;
	currentAmount: number;
	targetAmount?: number;
	goalId?: string;
	isActive?: boolean;
	progressPercentage?: number;
	updatedAt: string;
}

export interface ServerProgressResponse {
	serverId: string;
	serverName: string;
	resources: ResourceProgress[];
}

export interface ResourceGoal {
	id: string;
	serverId: string;
	name: string;
	resourceType: string;
	targetAmount: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateGoalData {
	serverId: string;
	name: string;
	resourceType: string;
	targetAmount: number;
	isActive?: boolean;
}

export interface UpdateGoalData {
	serverId?: string;
	name?: string;
	resourceType?: string;
	targetAmount?: number;
	isActive?: boolean;
}
