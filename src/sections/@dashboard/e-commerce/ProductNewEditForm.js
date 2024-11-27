import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Divider, Grid, Stack, Typography } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// components
import FormProvider, {
  RHFEditor,
  RHFSelect,
  RHFTextField,
  RHFUpload
} from '../../../components/hook-form';
import { useSnackbar } from '../../../components/snackbar';
import { createJournal, getJournalById, updateJournal } from '../../../controller/propertiesController';
// ----------------------------------------------------------------------
const COUNTRY_OPTIONS = [
    { code: 'AD', label: 'Andorra' },
    { code: 'AE', label: 'United Arab Emirates' },
    { code: 'AF', label: 'Afghanistan' },
    { code: 'AG', label: 'Antigua and Barbuda' },
    { code: 'AI', label: 'Anguilla' },
    { code: 'AL', label: 'Albania' },
    { code: 'AM', label: 'Armenia' },
    { code: 'AO', label: 'Angola' },
    { code: 'AQ', label: 'Antarctica' },
    { code: 'AR', label: 'Argentina' },
    { code: 'AS', label: 'American Samoa' },
    { code: 'AT', label: 'Austria' },
    { code: 'AU', label: 'Australia', suggested: true },
    { code: 'AW', label: 'Aruba' },
    { code: 'AX', label: 'Alland Islands' },
    { code: 'AZ', label: 'Azerbaijan' },
    { code: 'BA', label: 'Bosnia and Herzegovina' },
    { code: 'BB', label: 'Barbados' },
    { code: 'BD', label: 'Bangladesh' },
    { code: 'BE', label: 'Belgium' },
    { code: 'BF', label: 'Burkina Faso' },
    { code: 'BG', label: 'Bulgaria' },
    { code: 'BH', label: 'Bahrain' },
    { code: 'BI', label: 'Burundi' },
    { code: 'BJ', label: 'Benin' },
    { code: 'BL', label: 'Saint Barthelemy' },
    { code: 'BM', label: 'Bermuda' },
    { code: 'BN', label: 'Brunei Darussalam' },
    { code: 'BO', label: 'Bolivia' },
    { code: 'BR', label: 'Brazil' },
    { code: 'BS', label: 'Bahamas' },
    { code: 'BT', label: 'Bhutan' },
    { code: 'BV', label: 'Bouvet Island' },
    { code: 'BW', label: 'Botswana' },
    { code: 'BY', label: 'Belarus' },
    { code: 'BZ', label: 'Belize' },
    { code: 'CA', label: 'Canada', suggested: true },
    { code: 'CC', label: 'Cocos (Keeling) Islands' },
    { code: 'CD', label: 'Congo, Democratic Republic of the' },
    { code: 'CF', label: 'Central African Republic' },
    { code: 'CG', label: 'Congo, Republic of the' },
    { code: 'CH', label: 'Switzerland' },
    { code: 'CI', label: "Cote d'Ivoire" },
    { code: 'CK', label: 'Cook Islands' },
    { code: 'CL', label: 'Chile' },
    { code: 'CM', label: 'Cameroon' },
    { code: 'CN', label: 'China' },
    { code: 'CO', label: 'Colombia' },
    { code: 'CR', label: 'Costa Rica' },
    { code: 'CU', label: 'Cuba' },
    { code: 'CV', label: 'Cape Verde' },
    { code: 'CW', label: 'Curacao' },
    { code: 'CX', label: 'Christmas Island' },
    { code: 'CY', label: 'Cyprus' },
    { code: 'CZ', label: 'Czech Republic' },
    { code: 'DE', label: 'Germany', suggested: true },
    { code: 'DJ', label: 'Djibouti' },
    { code: 'DK', label: 'Denmark' },
    { code: 'DM', label: 'Dominica' },
    { code: 'DO', label: 'Dominican Republic' },
    { code: 'DZ', label: 'Algeria' },
    { code: 'EC', label: 'Ecuador' },
    { code: 'EE', label: 'Estonia' },
    { code: 'EG', label: 'Egypt' },
    { code: 'EH', label: 'Western Sahara' },
    { code: 'ER', label: 'Eritrea' },
    { code: 'ES', label: 'Spain' },
    { code: 'ET', label: 'E thiopia' },
    { code: 'FI', label: 'Finland' },
    { code: 'FJ', label: 'Fiji' },
    { code: 'FK', label: 'Falkland Islands (Malvinas)' },
    { code: 'FM', label: 'Micronesia, Federated States of' },
    { code: 'FO', label: 'Faroe Islands' },
    { code: 'FR', label: 'France', suggested: true },
    { code: 'GA', label: 'Gabon' },
    { code: 'GB', label: 'United Kingdom' },
    { code: 'GD', label: 'Grenada' },
    { code: 'GE', label: 'Georgia' },
    { code: 'GF', label: 'French Guiana' },
    { code: 'GG', label: 'Guernsey' },
    { code: 'GH', label: 'Ghana' },
    { code: 'GI', label: 'Gibraltar' },
    { code: 'GL', label: 'Greenland' },
    { code: 'GM', label: 'Gambia' },
    { code: 'GN', label: 'Guinea' },
    { code: 'GP', label: 'Guadeloupe' },
    { code: 'GQ', label: 'Equatorial Guinea' },
    { code: 'GR', label: 'Greece' },
    { code: 'GS', label: 'South Georgia and the South Sandwich Islands' },
    { code: 'GT', label: 'Guatemala' },
    { code: 'GU', label: 'Guam' },
    { code: 'GW', label: 'Guinea-Bissau' },
    { code: 'GY', label: 'Guyana' },
    { code: 'HK', label: 'Hong Kong' },
    { code: 'HM', label: 'Heard Island and McDonald Islands' },
    { code: 'HN', label: 'Honduras' },
    { code: 'HR', label: 'Croatia' },
    { code: 'HT', label: 'Haiti' },
    { code: 'HU', label: 'Hungary' },
    { code: 'ID', label: 'Indonesia' },
    { code: 'IE', label: 'Ireland' },
    { code: 'IL', label: 'Israel' },
    { code: 'IM', label: 'Isle of Man' },
    { code: 'IN', label: 'India' },
    { code: 'IO', label: 'British Indian Ocean Territory' },
    { code: 'IQ', label: 'Iraq' },
    { code: 'IR', label: 'Iran, Islamic Republic of' },
    { code: 'IS', label: 'Iceland' },
    { code: 'IT', label: 'Italy' },
    { code: 'JE', label: 'Jersey' },
    { code: 'JM', label: 'Jamaica' },
    { code: 'JO', label: 'Jordan' },
    { code: 'JP', label: 'Japan', suggested: true },
    { code: 'KE', label: 'Kenya' },
    { code: 'KG', label: 'Kyrgyzstan' },
    { code: 'KH', label: 'Cambodia' },
    { code: 'KI', label: 'Kiribati' },
    { code: 'KM', label: 'Comoros' },
    { code: 'KN', label: 'Saint Kitts and Nevis' },
    { code: 'KP', label: "Korea, Democratic People's Republic of" },
    { code: 'KR', label: 'Korea, Republic of' },
    { code: 'KW', label: 'Kuwait' },
    { code: 'KY', label: 'Cayman Islands' },
    { code: 'KZ', label: 'Kazakhstan' },
    { code: 'LA', label: "Lao People's Democratic Republic" },
    { code: 'LB', label: 'Lebanon' },
    { code: 'LC', label: 'Saint Lucia' },
    { code: 'LI', label: 'Liechtenstein' },
    { code: 'LK', label: 'Sri Lanka' },
    { code: 'LR', label: 'Liberia' },
    { code: 'LS', label: 'Lesotho' },
    { code: 'LT', label: 'Lithuania' },
    { code: 'LU', label: 'Luxembourg' },
    { code: 'LV', label: 'Latvia' },
    { code: 'LY', label: 'Libya' },
    { code: 'MA', label: 'Morocco' },
    { code: 'MC', label: 'Monaco' },
    { code: 'MD', label: 'Moldova, Republic of' },
    { code: 'ME', label: 'Montenegro' },
    { code: 'MF', label: 'Saint Martin (French part)' },
    { code: 'MG', label: 'Madagascar' },
    { code: 'MH', label: 'Marshall Islands' },
    { code: 'MK', label: 'Macedonia, the Former Yugoslav Republic of' },
    { code: 'ML', label: 'Mali' },
    { code: 'MM', label: 'Myanmar' },
    { code: 'MN', label: 'Mongolia' },
    { code: 'MO', label: 'Macao' },
    { code: 'MP', label: 'Northern Mariana Islands' },
    { code: 'MQ', label: 'Martinique' },
    { code: 'MR', label: 'Mauritania' },
    { code: 'MS', label: 'Montserrat' },
    { code: 'MT', label: 'Malta' },
    { code: 'MU', label: 'Mauritius' },
    { code: 'MV', label: 'Maldives' },
    { code: 'MW', label: 'Malawi' },
    { code: 'MX', label: 'Mexico' },
    { code: 'MY', label: 'Malaysia' },
    { code: 'MZ', label: 'Mozambique' },
    { code: 'NA', label: 'Namibia' },
    { code: 'NC', label: 'New Caledonia' },
    { code: 'NE', label: 'Niger' },
    { code: 'NF', label: 'Norfolk Island' },
    { code: 'NG', label: 'Nigeria' },
    { code: 'NI', label: 'Nicaragua' },
    { code: 'NL', label: 'Netherlands' },
    { code: 'NO', label: 'Norway' },
    { code: 'NP', label: 'Nepal' },
    { code: 'NR', label: 'Nauru' },
    { code: 'NU', label: 'Niue' },
    { code: 'NZ', label: 'New Zealand' },
    { code: 'OM', label: 'Oman' },
    { code: 'PA', label: 'Panama' },
    { code: 'PE', label: 'Peru' },
    { code: 'PF', label: 'French Polynesia' },
    { code: 'PG', label: 'Papua New Guinea' },
    { code: 'PH', label: 'Philippines' },
    { code: 'PK', label: 'Pakistan' },
    { code: 'PL', label: 'Poland' },
    { code: 'PM', label: 'Saint Pierre and Miquelon' },
    { code: 'PN', label: 'Pitcairn' },
    { code: 'PR', label: 'Puerto Rico' },
    { code: 'PS', label: 'Palestine, State of' },
    { code: 'PT', label: 'Portugal' },
    { code: 'PW', label: 'Palau' },
    { code: 'PY', label: 'Paraguay' },
    { code: 'QA', label: 'Qatar' },
    { code: 'RE', label: 'Reunion' },
    { code: 'RO', label: 'Romania' },
    { code: 'RS', label: 'Serbia' },
    { code: 'RU', label: 'Russian Federation' },
    { code: 'RW', label: 'Rwanda' },
    { code: 'SA', label: 'Saudi Arabia' },
    { code: 'SB', label: 'Solomon Islands' },
    { code: 'SC', label: 'Seychelles' },
    { code: 'SD', label: 'Sudan' },
    { code: 'SE', label: 'Sweden' },
    { code: 'SG', label: 'Singapore' },
    { code: 'SH', label: 'Saint Helena' },
    { code: 'SI', label: 'Slovenia' },
    { code: 'SJ', label: 'Svalbard and Jan Mayen' },
    { code: 'SK', label: 'Slovakia' },
    { code: 'SL', label: 'Sierra Leone' },
    { code: 'SM', label: 'San Marino' },
    { code: 'SN', label: 'Senegal' },
    { code: 'SO', label: 'Somalia' },
    { code: 'SR', label: 'Suriname' },
    { code: 'SS', label: 'South Sudan' },
    { code: 'ST', label: 'Sao Tome and Principe' },
    { code: 'SV', label: 'El Salvador' },
    { code: 'SX', label: 'Sint Maarten (Dutch part)' },
    { code: 'SY', label: 'Syrian Arab Republic' },
    { code: 'SZ', label: 'Swaziland' },
    { code: 'TC', label: 'Turks and Caicos Islands' },
    { code: 'TD', label: 'Chad' },
    { code: 'TF', label: 'French Southern Territories' },
    { code: 'TG', label: 'Togo' },
    { code: 'TH', label: 'Thailand' },
    { code: 'TJ', label: 'Tajikistan' },
    { code: 'TK', label: 'Tokelau' },
    { code: 'TL', label: 'Timor-Leste' },
    { code: 'TM', label: 'Turkmenistan' },
    { code: 'TN', label: 'Tunisia' },
    { code: 'TO', label: 'Tonga' },
    { code: 'TR', label: 'Turkey' },
    { code: 'TT', label: 'Trinidad and Tobago' },
    { code: 'TV', label: 'Tuvalu' },
    { code: 'TW', label: 'Taiwan, Province of China' },
    { code: 'TZ', label: 'United Republic of Tanzania' },
    { code: 'UA', label: 'Ukraine' },
    { code: 'UG', label: 'Uganda' },
    { code: 'US', label: 'United States', suggested: true },
    { code: 'UY', label: 'Uruguay' },
    { code: 'UZ', label: 'Uzbekistan' },
    { code: 'VA', label: 'Holy See (Vatican City State)' },
    { code: 'VC', label: 'Saint Vincent and the Grenadines' },
    { code: 'VE', label: 'Venezuela' },
    { code: 'VG', label: 'British Virgin Islands' },
    { code: 'VI', label: 'US Virgin Islands' },
    { code: 'VN', label: 'Vietnam' },
    { code: 'VU', label: 'Vanuatu' },
    { code: 'WF', label: 'Wallis and Futuna' },
    { code: 'WS', label: 'Samoa' },
    { code: 'XK', label: 'Kosovo' },
    { code: 'YE', label: 'Yemen' },
    { code: 'YT', label: 'Mayotte' },
    { code: 'ZA', label: 'South Africa' },
    { code: 'ZM', label: 'Zambia' },
    { code: 'ZW', label: 'Zimbabwe' },
  ];
// Add more countries as needed
const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'English' },
  { label: 'Spanish', value: 'Spanish' },
  { label: 'French', value: 'French' },
  // Add more languages as needed
];
const FREQUENCY_OPTIONS = [
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Bi-Monthly', value: 'Bi-Monthly' },
  { label: 'Quarterly', value: 'Quarterly' },
  { label: 'Annually', value: 'Annually' },
];
const LICENSE_TYPE_OPTIONS = [
  { label: 'CC BY-SA', value: 'CC BY-SA' },
  { label: 'CC BY-NC', value: 'CC BY-NC' },
  { label: 'CC BY-NC-SA', value: 'CC BY-NC-SA' },
  { label: 'CC BY-ND', value: 'CC BY-ND' },
  { label: 'CC BY-NC-ND', value: 'CC BY-NC-ND' },
];
// ----------------------------------------------------------------------
JournalForm.propTypes = {
  isEdit: PropTypes.bool,
  currentJournal: PropTypes.shape({
    title: PropTypes.string.isRequired,
    abbreviation: PropTypes.string,
    url: PropTypes.string,
    issnPrint: PropTypes.string,
    issnOnline: PropTypes.string,
    publisher: PropTypes.string,
    discipline: PropTypes.string,
    chiefEditor: PropTypes.string,
    email: PropTypes.string,
    country: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    frequency: PropTypes.string.isRequired,
    yearOfStarting: PropTypes.number,
    articleFormat: PropTypes.string,
    licenseType: PropTypes.string.isRequired,
    coverImage: PropTypes.arrayOf(PropTypes.string).isRequired,
    description: PropTypes.string,
  }),
};
function countryToFlag(isoCode) {
  return typeof String.fromCodePoint !== 'undefined'
    ? isoCode
      .toUpperCase()
      .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    : isoCode;
}
export default function
  JournalForm({ isEdit, currentJournal }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const JournalSchema = Yup.object().shape({
    title: Yup.string().required('Journal Title is required'),
    abbreviation: Yup.string(),
    url: Yup.string().url('Invalid URL format'),
    issnPrint: Yup.string(),
    issnOnline: Yup.string(),
    publisher: Yup.string(),
    discipline: Yup.string(),
    chiefEditor: Yup.string(),
    email: Yup.string().email('Invalid email format'),
    country: Yup.string().required('Country is required'),
    language: Yup.string().required('Language is required'),
    frequency: Yup.string().required('Frequency is required'),
    yearOfStarting: Yup.number().integer().min(1900, 'Invalid year'),
    articleFormat: Yup.string(),
    licenseType: Yup.string().required('License Type is required'),
    // coverImage: Yup.mixed(),
    coverImage: Yup.array().min(1, 'At least one image is required'),
    description: Yup.string().max(20000, 'Description must not exceed 200 words'),
  });
  const defaultValues = useMemo(
    () => ({
      title: currentJournal?.title || '',
      abbreviation: currentJournal?.abbreviation || '',
      url: currentJournal?.url || '',
      issnPrint: currentJournal?.issnPrint || '',
      issnOnline: currentJournal?.issnOnline || '',
      publisher: currentJournal?.publisher || '',
      discipline: currentJournal?.discipline || '',
      chiefEditor: currentJournal?.chiefEditor || '',
      email: currentJournal?.email || '',
      country: currentJournal?.country || COUNTRY_OPTIONS[0].value,
      language: currentJournal?.language || LANGUAGE_OPTIONS[0].value,
      frequency: currentJournal?.frequency || FREQUENCY_OPTIONS[0].value,
      yearOfStarting: currentJournal?.yearOfStarting || '',
      articleFormat: currentJournal?.articleFormat || '',
      licenseType: currentJournal?.licenseType || LICENSE_TYPE_OPTIONS[0].value,
      coverImage: [],
      description: currentJournal?.description || '',
    }),
    [currentJournal]
  );
  const methods = useForm({
    resolver: yupResolver(JournalSchema),
    defaultValues,
  });
  const {
    reset, watch, setValue, handleSubmit, control, formState: { isSubmitting },
  } = methods;
  const values = watch();
  useEffect(() => {
    const fetchJournal = async () => {
      if (isEdit) {
        try {
          const journal = await getJournalById(id);
          if (journal) {
            console.log('Fetched Journal Data:', journal);
            reset({
              title: journal?.title || '',
              abbreviation: journal?.abbreviation || '',
              url: journal?.url || '',
              issnPrint: journal?.issnPrint || '',
              issnOnline: journal?.issnOnline || '',
              publisher: journal?.publisher || '',
              discipline: journal?.discipline || '',
              chiefEditor: journal?.chiefEditor || '',
              email: journal?.email || '',
              country: journal?.country || COUNTRY_OPTIONS[0].value,
              language: journal?.language || LANGUAGE_OPTIONS[0].value,
              frequency: journal?.frequency || FREQUENCY_OPTIONS[0].value,
              yearOfStarting: journal?.yearOfStarting || '',
              articleFormat: journal?.articleFormat || '',
              licenseType: journal?.licenseType || LICENSE_TYPE_OPTIONS[0].value,
              coverImage: journal?.coverImage || [],
              // images: property.PropertyImages || [], // Ensure this matches the form field name
              description: journal?.description || '',
            });
            console.log('Form has been reset with fetched journal data');
          } else {
            enqueueSnackbar('Journal not found', { variant: 'error' });
            navigate(PATH_DASHBOARD.eCommerce.list);
          }
        } catch (error) {
          console.error('Error fetching journal:', error);
          enqueueSnackbar('An error occurred while fetching journal details', { variant: 'error' });
        }
      }
    };
    fetchJournal();
  }, [id, isEdit, reset, enqueueSnackbar, navigate]);
  useEffect(() => {
    if (isEdit && currentJournal) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, currentJournal, reset, defaultValues]);
  const onSubmit = async (data) => {
    console.log("Submitting Data:", data);  // Ensure this is printed in the console
    try {
      if (isEdit) {
        await updateJournal(id, data); // Call your update function
      } else {
        await createJournal(data); // Call your create function
      }
      reset();
      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_DASHBOARD.eCommerce.list);
    } catch (error) {
      console.error("Error during submission:", error);
      enqueueSnackbar('An error occurred. Please try again.', { variant: 'error' });
    }
  };
  const handleDrop = useCallback(
    (acceptedFiles) => {
      console.log('Files dropped:', acceptedFiles);  // Add this line to check if files are being handled
      const files = values.coverImage || [];
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      setValue('coverImage', [...files, ...newFiles], { shouldValidate: true });
    },
    [setValue, values.coverImage]
  );
  const handleRemoveFile = (inputFile) => {
    const filtered = values.images && values.coverImage?.filter((file) => file !== inputFile);
    setValue('coverImage', filtered);
  };
  const handleRemoveAllFiles = () => {
    setValue('coverImage', []);
  };
  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <Box display="flex" alignItems="center">
                <Divider style={{ flexGrow: 1 }} />
                <Typography variant="h4" style={{ margin: '0 16px', whiteSpace: 'nowrap' }}>
                  Journal Submission
                </Typography>
                <Divider style={{ flexGrow: 1 }} />
              </Box>
              <Stack spacing={3} style={{ marginTop: "30px" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="title" label="Journal Title*" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="abbreviation" label="Abbreviation" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="url" label="Journal URL" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="issnPrint" label="ISSN (Print Version)" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="issnOnline" label="ISSN (Online Version)" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="publisher" label="Publisher / Co-Publisher" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="discipline" label="Discipline" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="chiefEditor" label="Chief Editor" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="email" label="Email Id" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {/* <Block title="Country Select"> */}
                    <RHFSelect native name="country" label="Country" fullWidth>
                      <option value="" />
                      {COUNTRY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </RHFSelect>
                    {/* </Block> */}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="language" label="Langauge" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFSelect native name="frequency" label="Frequency" fullWidth>
                      <option value="" />
                      {FREQUENCY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </RHFSelect>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="yearOfStarting" label="Year of Starting" type="number" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="articleFormat" label="Indexing Since" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFSelect native name="licenseType" label="License Type" fullWidth>
                      <option value="" />
                      {LICENSE_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </RHFSelect>
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <Typography variant="title" style={{ fontWeight: "bold" }}>
                      Cover Image
                    </Typography>
                    <RHFUpload
                      multiple
                      thumbnail
                      name="coverImage"
                      maxSize={3145728}
                      accept="image/*"  // Only accept image files
                      onDrop={handleDrop}
                      onRemove={handleRemoveFile}
                      onRemoveAll={handleRemoveAllFiles}
                      onUpload={() => console.log('ON UPLOAD')}
                    />
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <Typography variant="title" style={{ fontWeight: "bold" }}>
                      Description
                    </Typography>
                    <RHFEditor simple name="description" />
                  </Grid>
                  <Grid container spacing={2} justifyContent="flex-end" style={{marginTop:"20px"}}>
                    <Grid item>
                      <LoadingButton type="submit" variant="contained" size="large">
                        {!isEdit ? 'Save' : 'Save Changes'}
                      </LoadingButton>
                    </Grid>
                    <Grid item>
                      <LoadingButton
                        type="button"
                        variant="outlined"
                        size="large"
                        onClick={() => reset()}
                      >
                        Reset
                      </LoadingButton>
                    </Grid>
                  </Grid>
                </Grid>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
      <br />
          </>
  );
}






// const handleFeaturedStatusChange = async (id, event) => {
//   const newStatus = event.target.checked;
//   try {
//     // Update Firestore
//     await updatePropertyFeaturedStatus(id, newStatus);
//     console.log(`Featured status updated to ${newStatus} for property ID: ${id}`);
//     enqueueSnackbar('Featured status updated successfully');
//     // Update the featured status in the state
//     const updatedProperties = properties.map(property =>
//       property.id === id ? { ...property, featuredStatus: newStatus } : property
//     );
//     setProperties(updatedProperties);
//   } catch (e) {
//     console.error("Error updating featured status: ", e);
//     enqueueSnackbar(`Error updating featured status: ${e.message}`, { variant: 'error' });
//     // Revert the status change in case of error
//     const revertedProperties = properties.map(property =>
//       property.id === id ? { ...property, featuredStatus: !newStatus } : property
//     );
//     setProperties(revertedProperties);
//   }
// };