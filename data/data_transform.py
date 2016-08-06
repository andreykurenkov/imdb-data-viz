import pandas as pd
import numpy as np

def filter_data(data,field,start,end):
    return data[data[field]>=start][data[field]<=end]

def create_yearly_data(data):
    grouped = data.groupby('year')
    yearly_sum = grouped.sum()
    yearly_sum['count'] = grouped.size()
    return yearly_sum

def create_counts_data(data,column):
    return data.groupby(column).size()

def remove_outliers(data, column, num_deviations=2):
    column_data = data[column]
    valid_data = column_data[np.abs(column_data-column_data.mean())<=(num_deviations*column_data.std())]
    return valid_data

def create_binned_data(data,column,num_bins=100):
    result = pd.cut(data,bins=num_bins,include_lowest=True)
    return pd.value_counts(result).reindex(result.cat.categories)


data = pd.read_csv('movies.tsv',sep='\t')

yearly_data = create_yearly_data(data)
yearly_data.to_csv('yearly_data.tsv',sep='\t')

rating_data = create_counts_data(data,'rating')
rating_data.to_csv('rating_data.tsv',sep='\t',
                   index_label='rating',header=['count'])

recent_data = filter_data(data,'year',2008,2013)
recent_length_data = filter_data(recent_data,'length',1,180)['length']
length_data = create_binned_data(recent_length_data,'length',num_bins=179)
length_data.to_csv('length_data.tsv',sep='\t',
                   index_label='length',header=['count'])

recent_budget_data = remove_outliers(recent_data,'budget')
budget_data = create_binned_data(recent_budget_data,'budget')
budget_data.to_csv('budget_data.tsv',sep='\t',
                   index_label='budget',header=['count'])

recent_votes_data = np.log10(recent_data['votes'])
votes_data = create_binned_data(recent_votes_data,'votes',num_bins=150)
votes_data.to_csv('votes_data.tsv',sep='\t',
                   index_label='votes',header=['count'])

