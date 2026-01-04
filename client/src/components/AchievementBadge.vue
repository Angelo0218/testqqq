<template>
  <div
    class="achievement-badge"
    :class="{
      'achievement-badge--unlocked': achievement.unlocked,
      'achievement-badge--locked': !achievement.unlocked,
      [`achievement-badge--${achievement.category}`]: true
    }"
  >
    <!-- Badge Icon Container -->
    <div class="achievement-badge__icon-container">
      <div class="achievement-badge__icon-bg">
        <q-icon
          :name="achievement.icon || 'emoji_events'"
          :size="iconSize"
          :color="achievement.unlocked ? 'white' : 'grey-7'"
          class="achievement-badge__icon"
        />
      </div>
      
      <!-- Unlock glow effect -->
      <div v-if="achievement.unlocked" class="achievement-badge__glow"></div>
      
      <!-- Lock overlay for locked achievements -->
      <div v-if="!achievement.unlocked" class="achievement-badge__lock-overlay">
        <q-icon name="lock" size="16px" color="grey-6" />
      </div>
    </div>
    
    <!-- Badge Info -->
    <div class="achievement-badge__info">
      <div class="achievement-badge__name">{{ achievement.name }}</div>
      <div class="achievement-badge__description">{{ achievement.description }}</div>
      
      <!-- Unlock time for unlocked achievements -->
      <div v-if="achievement.unlocked && achievement.unlockedAt" class="achievement-badge__unlock-time">
        <q-icon name="schedule" size="12px" />
        <span>{{ formatUnlockTime(achievement.unlockedAt) }}</span>
      </div>
    </div>
    
    <!-- Category indicator -->
    <div class="achievement-badge__category">
      <q-icon :name="getCategoryIcon(achievement.category)" size="14px" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  achievement: {
    type: Object,
    required: true,
    validator: (val) => {
      return val && typeof val.id === 'string' && typeof val.name === 'string';
    }
  },
  size: {
    type: String,
    default: 'medium',
    validator: (val) => ['small', 'medium', 'large'].includes(val)
  }
});

// Icon size based on badge size
const iconSize = computed(() => {
  const sizes = {
    small: '24px',
    medium: '32px',
    large: '48px'
  };
  return sizes[props.size] || sizes.medium;
});

// Category icons mapping
const getCategoryIcon = (category) => {
  const icons = {
    focus: 'timer',
    task: 'check_circle',
    diary: 'book',
    meal: 'restaurant'
  };
  return icons[category] || 'emoji_events';
};

// Format unlock time
const formatUnlockTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Expose for testing
defineExpose({
  getCategoryIcon,
  formatUnlockTime
});
</script>

<style scoped lang="scss">
// Category colors
$category-colors: (
  focus: #FF2D55,
  task: #30D158,
  diary: #0A84FF,
  meal: #FF9500
);

.achievement-badge {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #1C1C1E;
  border-radius: 16px;
  border: 1px solid #38383A;
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
  
  &:hover {
    background: #2C2C2E;
    transform: translateY(-2px);
  }
  
  // Unlocked state
  &--unlocked {
    .achievement-badge__icon-bg {
      opacity: 1;
    }
    
    .achievement-badge__name {
      color: #FFFFFF;
    }
    
    .achievement-badge__description {
      color: #8E8E93;
    }
  }
  
  // Locked state
  &--locked {
    .achievement-badge__icon-bg {
      opacity: 0.4;
      background: #2C2C2E !important;
    }
    
    .achievement-badge__name {
      color: #636366;
    }
    
    .achievement-badge__description {
      color: #48484A;
    }
  }
  
  // Category-specific colors
  @each $category, $color in $category-colors {
    &--#{$category} {
      .achievement-badge__icon-bg {
        background: linear-gradient(135deg, $color, darken($color, 15%));
      }
      
      .achievement-badge__glow {
        background: radial-gradient(circle, rgba($color, 0.3) 0%, transparent 70%);
      }
      
      .achievement-badge__category {
        color: $color;
      }
    }
  }
  
  &__icon-container {
    position: relative;
    flex-shrink: 0;
  }
  
  &__icon-bg {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }
  
  &__icon {
    z-index: 1;
  }
  
  &__glow {
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    border-radius: 50%;
    animation: glow-pulse 2s ease-in-out infinite;
    pointer-events: none;
  }
  
  &__lock-overlay {
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 24px;
    height: 24px;
    background: #1C1C1E;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #38383A;
  }
  
  &__info {
    flex: 1;
    min-width: 0;
  }
  
  &__name {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.3;
    margin-bottom: 4px;
    transition: color 0.25s ease;
  }
  
  &__description {
    font-size: 13px;
    line-height: 1.4;
    transition: color 0.25s ease;
  }
  
  &__unlock-time {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: 11px;
    color: #636366;
  }
  
  &__category {
    position: absolute;
    top: 12px;
    right: 12px;
    opacity: 0.6;
  }
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}
</style>
