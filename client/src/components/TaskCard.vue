<template>
  <q-slide-item
    @left="onSlideLeft"
    @right="onSlideRight"
    left-color="negative"
    right-color="positive"
    class="task-card-slide"
  >
    <template v-slot:left>
      <q-icon name="delete" />
    </template>
    <template v-slot:right>
      <q-icon name="edit" />
    </template>
    
    <q-item
      clickable
      class="task-card"
      :class="[
        `task-card--priority-${task.priority || 'medium'}`,
        { 'task-card--completed': task.completed }
      ]"
      @click="onToggle"
    >
      <!-- Priority indicator -->
      <div class="task-card__priority-bar" :style="{ backgroundColor: priorityColor }"></div>
      
      <!-- Checkbox -->
      <q-item-section side>
        <q-checkbox
          :model-value="task.completed"
          :color="priorityColorName"
          @update:model-value="onToggle"
          class="task-card__checkbox"
        />
      </q-item-section>
      
      <!-- Task content -->
      <q-item-section>
        <q-item-label
          class="task-card__title"
          :class="{ 'task-card__title--completed': task.completed }"
        >
          {{ task.task }}
        </q-item-label>
        <q-item-label caption class="task-card__date">
          <q-icon name="event" size="12px" class="q-mr-xs" />
          {{ formatDate(task.date) }}
        </q-item-label>
      </q-item-section>
      
      <!-- Actions -->
      <q-item-section side>
        <q-btn
          flat
          round
          dense
          icon="more_vert"
          color="grey-6"
          @click.stop="showMenu = true"
        >
          <q-menu v-model="showMenu">
            <q-list style="min-width: 120px">
              <q-item clickable v-close-popup @click="onEdit">
                <q-item-section avatar>
                  <q-icon name="edit" size="20px" />
                </q-item-section>
                <q-item-section>編輯</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="onDelete">
                <q-item-section avatar>
                  <q-icon name="delete" color="negative" size="20px" />
                </q-item-section>
                <q-item-section class="text-negative">刪除</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-item-section>
    </q-item>
  </q-slide-item>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  task: {
    type: Object,
    required: true,
    validator: (val) => {
      return val && typeof val.id !== 'undefined' && typeof val.task === 'string';
    }
  }
});

const emit = defineEmits(['toggle', 'delete', 'edit']);

const showMenu = ref(false);

// Priority color mapping
const PRIORITY_COLORS = {
  high: '#FF2D55',    // Red
  medium: '#FF9500',  // Orange
  low: '#30D158'      // Green
};

const PRIORITY_COLOR_NAMES = {
  high: 'negative',
  medium: 'warning',
  low: 'positive'
};

// Computed priority color
const priorityColor = computed(() => {
  const priority = props.task.priority || 'medium';
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
});

const priorityColorName = computed(() => {
  const priority = props.task.priority || 'medium';
  return PRIORITY_COLOR_NAMES[priority] || PRIORITY_COLOR_NAMES.medium;
});

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric'
  });
};

// Event handlers
const onToggle = () => {
  emit('toggle', props.task.id);
};

const onDelete = () => {
  emit('delete', props.task.id);
};

const onEdit = () => {
  emit('edit', props.task.id);
};

const onSlideLeft = ({ reset }) => {
  onDelete();
  reset();
};

const onSlideRight = ({ reset }) => {
  onEdit();
  reset();
};

// Expose for testing
defineExpose({
  priorityColor,
  PRIORITY_COLORS
});
</script>


<style scoped lang="scss">
.task-card-slide {
  margin-bottom: 8px;
  border-radius: 12px;
  overflow: hidden;
}

.task-card {
  position: relative;
  background: #1C1C1E;
  border: 1px solid #38383A;
  border-radius: 12px;
  padding: 12px 16px;
  padding-left: 20px;
  min-height: 64px;
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
  
  &:hover {
    background: #2C2C2E;
  }
  
  &--completed {
    opacity: 0.6;
    
    .task-card__title {
      text-decoration: line-through;
      color: #8E8E93;
    }
  }
  
  // Priority bar on the left
  &__priority-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: 12px 0 0 12px;
  }
  
  &__checkbox {
    margin-right: 8px;
  }
  
  &__title {
    font-size: 15px;
    font-weight: 500;
    color: #FFFFFF;
    line-height: 1.4;
    transition: all 0.25s ease;
    
    &--completed {
      text-decoration: line-through;
      color: #8E8E93;
    }
  }
  
  &__date {
    font-size: 12px;
    color: #8E8E93;
    margin-top: 4px;
    display: flex;
    align-items: center;
  }
}

// Completion animation
.task-card--completed {
  animation: task-complete 0.3s ease-out;
}

@keyframes task-complete {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1);
  }
}
</style>
