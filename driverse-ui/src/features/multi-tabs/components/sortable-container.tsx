/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/layouts/dashboard/multi-tabs/components/sortable-container.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/layouts/dashboard/multi-tabs/components/sortable-container.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim with the zh-CN comments translated. No app imports
 *        at all — it is pure @dnd-kit — so this file needed no decoupling. The 8px pointer activation
 *        distance matters: without it a click on a tab is swallowed as a drag.
 */

import {
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	MeasuringStrategy,
	PointerSensor,
	TouchSensor,
	closestCenter,
	defaultDropAnimationSideEffects,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import React from "react";

interface SortableContainerProps {
	items: any[];
	onSortEnd?: (oldIndex: number, newIndex: number) => void;
	children: React.ReactNode;
	renderOverlay?: (activeId: string | number) => React.ReactNode;
}

const SortableContainer: React.FC<SortableContainerProps> = ({ items, onSortEnd, children, renderOverlay }) => {
	const [activeId, setActiveId] = React.useState<string | number | null>(null);

	// Drag sensor configuration
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // only start dragging after 8px of movement
			},
		}),
		useSensor(TouchSensor),
		useSensor(KeyboardSensor),
	);

	// Drag start
	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id);
	};

	// Drag end
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		if (over && active.id !== over.id) {
			const oldIndex = items.findIndex((item) => item.key === active.id);
			const newIndex = items.findIndex((item) => item.key === over.id);

			if (oldIndex !== -1 && newIndex !== -1) {
				onSortEnd?.(oldIndex, newIndex);
			}
		}
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
		>
			<SortableContext items={items.map((item) => item.key)} strategy={horizontalListSortingStrategy}>
				{children}
			</SortableContext>

			<DragOverlay
				dropAnimation={{
					sideEffects: defaultDropAnimationSideEffects({
						styles: {
							active: {
								opacity: "0.5",
							},
						},
					}),
				}}
			>
				{activeId && renderOverlay ? renderOverlay(activeId) : null}
			</DragOverlay>
		</DndContext>
	);
};

export default SortableContainer;
