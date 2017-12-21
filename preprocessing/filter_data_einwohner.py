import csv 
import json
from itertools import dropwhile 

def filter_interesting(s_r_y_n):
    '''composed filter function for mean_ages dataset
    '''
    return valid_year(s_r_y_n) and valid_name(s_r_y_n) and not_racist(s_r_y_n)

def not_racist(s_r_y_n):
    '''we only want the whole population, not the foreigners, women or men
    '''
    source, _, _, _ = s_r_y_n
    return 'gesamt' in source

def valid_name(s_r_y_n):
    '''we don't need the global statistics or the first line
    '''
    name = s_r_y_n[3]
    return 'Stadt München' not in name 

def valid_year(s_r_y_n):
    '''we are only interested in the following years: 2002,2003,2005,2008,2009
    because we only have data for the voter turnout
    '''
    year = s_r_y_n[2]
    return year == '2002' or year == '2003' or year == '2005' or year == '2008' or year == '2009'

# def is_gesamt(p_d_y_n):
#     '''we only want full datasets, not only foreigners or germans
#     '''
#     data_name = p_d_y_n[1]
#     return 'gesamt' in data_name

def prepare_name(s_r_y_n):
    '''we don't need the numbers in the front
    e.g "13 Bogenhausen"
    '''
    _, r, y, name = s_r_y_n
    cut_name = dropwhile(lambda c: c.isdigit(), name)
    # print (name, '|' , ''.join(list(cut_name)[1:]))

    return r,y, ''.join(list(cut_name)[1:])

def transform_district_names(r_y_n):
    '''Some rows have data for multiple districts, we want a single row per district
    e.g "Thalkirchen - Obersendling - Forstenried - Fürstenried - Solln"
    '''
    r, y, names = r_y_n
    all_names = names.split(' - ')

    return [(r,y,n) for n in all_names]

def print_list(l):
    '''shortcut for debug purposes
    '''
    for e in l:
        print(e)

def main():
    '''parse the csv file into multiple files based on the year and
    filter unnecessary data
    '''

    with open('einwohner.csv', 'r') as infile:
        csvreader = csv.reader(infile)

        source_ix = 2
        residents_ix = 3
        year_ix = 14
        name_ix = 17

        residents_data = []

        for row in csvreader:
            source       = row[source_ix]
            residents    = row[residents_ix]
            year         = row[year_ix]
            name         = row[name_ix]

          #  print('{}, {}, {}, {}'.format(source, residents, year, name))
            residents_data.append((source, residents, year, name))

    # drop first 
    residents_data = residents_data[1:]
    print('Before filtering: ', len(residents_data))

    # filter valid names
    filtered_residents_data = list(filter(lambda s_r_y_n: filter_interesting(s_r_y_n), residents_data))

    print('After filtering: ', len(filtered_residents_data))

    # map to more readable names and drop the data-name
    mapped_residents_data = list(map(prepare_name, filtered_residents_data))

    # transform the multiple districts to a single district per line
    transformed_residents_data = []
    for row in mapped_residents_data:
        single_districts = transform_district_names(row)
        for sd in single_districts:
            transformed_residents_data.append(sd)

    print('After transforming: ', len(transformed_residents_data))

    print_list(transformed_residents_data)

    # calculated_unemployment = []

    # with open('wahlbeteiligung_cleaned_count.json', 'r') as f:
    #     voter_turnout = json.load(f)

    #     for (unemployment_count, year, name) in transformed_unemployment:
    #         if (name in voter_turnout[year]):
    #             people_count = voter_turnout[year][name]
    #             unemployment_count = round(float(unemployment_count.replace(',', '.')))
    #             unemployment_rate = unemployment_count / float(people_count)
    #             print (unemployment_rate)
    #             calculated_unemployment.append((unemployment_rate, year, name))
    #         # else:
    #             # print ('Didn\'t find {} in {}: {}'.format(name, year, unemployment_count))

    dict = {}
    dict['2002'] = {}
    dict['2003'] = {}
    dict['2005'] = {}
    dict['2008'] = {}
    dict['2009'] = {}

    for (p, y, n) in transformed_residents_data:
        dict[y][n] = float(p.replace(',','.'))

    with open('einwohner_cleaned.json', 'w') as f:
        json.dump(dict, f)

if __name__ == '__main__':
    main()

