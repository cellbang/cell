import { DefaultLayout, Slot } from '@malagu/react';
import * as React from 'react';
import { AreaType } from '../area';
import styled from 'styled-components';
import { Box } from 'grommet';

const StyledWraper = styled.div`
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: hidden;
    z-index: 2;
`;

const StyledSidebar = styled.div`
    left: 0;
    position: absolute;
    top: 76px;
    bottom: 0;
    z-index: 1;
`;

const StyledMain = styled.div`
    left: 250px;
    position: absolute;
    right: 0;
    top: 70px;
    bottom: 0;
    overflow: auto;
    z-index: 0;
`;

export function TopLeftLayout({ children }: React.PropsWithChildren<{}>) {
    return (
        <StyledWraper>
            <Slot area={AreaType.TopArea}/>
            <StyledSidebar>
                <Slot area={AreaType.LeftArea}/>
            </StyledSidebar>
            <StyledMain>
                {children}
                <Slot area={AreaType.BottomArea}/>
            </StyledMain>
      </StyledWraper>
    );
}

export function MultiTopLayout({ children }: React.PropsWithChildren<{}>) {
    return (
        <Box>
            <Slot area={AreaType.TopArea}/>
            <Slot area={AreaType.SecondaryTopArea}/>
            <Slot area={AreaType.TertiaryTopArea}/>
            {children}
            <Slot area={AreaType.BottomArea}/>
      </Box>
    );
}

@DefaultLayout(TopLeftLayout)
export default class {}
