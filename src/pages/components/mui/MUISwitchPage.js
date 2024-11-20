import { Helmet } from 'react-helmet-async';
// @mui
import { Masonry } from '@mui/lab';
import { Box, Container, FormControl, FormControlLabel, FormGroup, Switch } from '@mui/material';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import { Block } from '../../../sections/_examples/Block';

// ----------------------------------------------------------------------

const COLORS = ['default', 'primary', 'secondary', 'info', 'success', 'warning', 'error'];

const PLACEMENTS = ['top', 'start', 'bottom', 'end'];

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  '& > *': { mx: '8px !important' },
};

// ----------------------------------------------------------------------

export default function MUISwitchPage() {
  return (
    <>
      <Helmet>
        <title> MUI Components: Switch | INTERNATIONAL JOURNAL INDEXING</title>
      </Helmet>

      <Box
        sx={{
          pt: 6,
          pb: 1,
          bgcolor: (theme) => (theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'),
        }}
      >
        <Container>
          <CustomBreadcrumbs
            heading="Switch"
            links={[
              {
                name: 'Components',
                href: PATH_PAGE.components,
              },
              { name: 'Switch' },
            ]}
            moreLink={['https://mui.com/components/switches']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Masonry columns={{ xs: 1, md: 2 }} spacing={3}>
          <Block title="Basic" sx={style}>
            <Switch defaultChecked />
            <Switch />
            <Switch disabled />
            <Switch disabled checked />
            <Switch defaultChecked color="default" />
          </Block>

          <Block title="Sizes" sx={style}>
            <FormGroup row>
              <FormControlLabel control={<Switch size="small" />} label="Small" />
              <FormControlLabel control={<Switch />} label="Normal" />
            </FormGroup>
          </Block>

          <Block title="Placement" sx={style}>
            <FormGroup row>
              {PLACEMENTS.map((placement) => (
                <FormControlLabel
                  key={placement}
                  value={placement}
                  label={placement}
                  labelPlacement={placement}
                  control={<Switch />}
                  sx={{ textTransform: 'capitalize' }}
                />
              ))}
            </FormGroup>
          </Block>

          <Block title="Colors">
            <FormControl component="fieldset">
              <FormGroup>
                {COLORS.map((color) => (
                  <FormControlLabel
                    key={color}
                    control={<Switch defaultChecked color={color} />}
                    label={color}
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}

                <FormControlLabel disabled control={<Switch color="error" />} label="Disabled" />
              </FormGroup>
            </FormControl>
          </Block>
        </Masonry>
      </Container>
    </>
  );
}