import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PlayButtonCustomizerProps {
  color: string;
  size: number;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

const presetColors = [
  { name: 'YouTube Red', value: '#ff0000' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Black', value: '#000000' },
  { name: 'Orange', value: '#f97316' },
];

export const PlayButtonCustomizer: React.FC<PlayButtonCustomizerProps> = ({
  color,
  size,
  onColorChange,
  onSizeChange,
  isOpen,
  onToggle,
}) => {
  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              Customize Play Button
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Color Selection */}
            <div className="space-y-3">
              <Label>Button Color</Label>
              
              {/* Color Presets */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {presetColors.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => onColorChange(preset.value)}
                    className={`w-full h-10 rounded-md border-2 transition-all hover:scale-105 ${
                      color === preset.value ? 'border-primary' : 'border-border'
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.name}
                  />
                ))}
              </div>
              
              {/* Custom Color Picker */}
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={color}
                  onChange={(e) => onColorChange(e.target.value)}
                  placeholder="#ff0000"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <Label>Button Size: {size}px</Label>
              <Slider
                value={[size]}
                onValueChange={(value) => onSizeChange(value[0])}
                min={64}
                max={160}
                step={8}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Small (64px)</span>
                <span>Large (160px)</span>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="flex justify-center p-8 bg-muted/30 rounded-lg">
                <div 
                  className="rounded-full shadow-xl flex items-center justify-center"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                  }}
                >
                  <div 
                    className="text-white triangle-right"
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: `${size * 0.2}px solid currentColor`,
                      borderTop: `${size * 0.15}px solid transparent`,
                      borderBottom: `${size * 0.15}px solid transparent`,
                      marginLeft: `${size * 0.05}px`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};