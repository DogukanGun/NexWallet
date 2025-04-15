import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { BookMarked } from 'lucide-react';
import { apiService } from '@/app/services/ApiService';

interface CharacterSelectorProps {
  enabled: boolean;
  selectedCharacter: string | null;
  onToggle: () => void;
  onSelect: (characterName: string) => void;
}

export function CharacterSelector({ 
  enabled, 
  selectedCharacter, 
  onToggle, 
  onSelect 
}: CharacterSelectorProps) {
  const [characters, setCharacters] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAvailableCharacters();
        
        // Capitalize the first letter of each character name
        const formattedCharacters = response.characters.map(
          (char: string) => char.charAt(0).toUpperCase() + char.slice(1)
        );
        
        setCharacters(formattedCharacters);
      } catch (error) {
        console.error('Error fetching characters:', error);
        // Fallback to basic character set if API fails
        setCharacters([
          'Pirate', 
          'Shakespeare', 
          'CryptoWizard', 
          'FriedrichMerz', 
          'DonaldTrump', 
          'ElonMusk', 
          'KevinHart'
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    if (enabled) {
      fetchCharacters();
    }
  }, [enabled]);

  return (
    <div className="flex items-center gap-2">
      <Button
        className={`shrink-0 rounded-full ${enabled ? 'bg-orange-500' : 'bg-gray-700'}`}
        variant="ghost"
        size="icon"
        onClick={onToggle}
        title={enabled ? "Character mode enabled" : "Character mode disabled"}
      >
        <BookMarked className="w-5 h-5" />
      </Button>
      
      {enabled && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="text-xs px-2 py-1 h-auto rounded-full">
              {loading ? 'Loading...' : selectedCharacter || 'Select character'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {characters.map((name) => (
              <DropdownMenuItem 
                key={name}
                onClick={() => onSelect(name)}
                className={selectedCharacter === name ? 'bg-orange-900 text-white' : ''}
              >
                {name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
} 