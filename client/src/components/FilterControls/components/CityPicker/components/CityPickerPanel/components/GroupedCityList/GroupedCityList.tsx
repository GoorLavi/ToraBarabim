import styled from 'styled-components';

import * as parentConsts from '../../consts';
import { CityPickerStateBlock } from '../CityPickerStateBlock/CityPickerStateBlock';
import { RecentCities } from '../RecentCities/RecentCities';
import { CityAreaBlock } from './components/CityAreaBlock/CityAreaBlock';
import { CityPickerAreaSkeleton } from './components/CityPickerAreaSkeleton/CityPickerAreaSkeleton';
import * as consts from './consts';
import type { GroupedCityListProps } from './models';
import * as styles from './styles';

export const GroupedCityList = styled(
  ({ className, suggestions, recentCities, expandedAreaCodes, onExpandArea, onSelect }: GroupedCityListProps) => {
    if (suggestions.kind === 'loading') {
      return (
        <div className={className}>
          {consts.SKELETON_AREA_KEYS.map((key) => (
            <CityPickerAreaSkeleton key={key} />
          ))}
        </div>
      );
    }

    if (suggestions.kind === 'error') {
      return (
        <CityPickerStateBlock
          className={className}
          {...{
            danger: true,
            title: consts.GROUPED_ERROR_HEADING,
            body: consts.GROUPED_ERROR_BODY,
            actions: [{ label: parentConsts.RETRY_LABEL, style: 'primary', onClick: suggestions.retry }],
          }}
        />
      );
    }

    if (suggestions.kind === 'empty') {
      return (
        <CityPickerStateBlock className={className} {...{ title: consts.GROUPED_EMPTY_HEADING, body: consts.GROUPED_EMPTY_BODY }} />
      );
    }

    return (
      <div className={className}>
        <RecentCities {...{ cities: recentCities, onSelect }} />
        {suggestions.areas.map((areaGroup) => (
          <CityAreaBlock
            key={areaGroup.area}
            {...{ areaGroup, isExpanded: expandedAreaCodes.has(areaGroup.area), onExpand: () => onExpandArea(areaGroup.area), onSelect }}
          />
        ))}
      </div>
    );
  },
)`
  ${styles.GroupedCityList}
`;
