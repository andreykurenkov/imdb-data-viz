import pandas as pd
import numpy as np

def filter_data_range(data,start,end):
    return data[data['year']>=start][data['year']<=end]

def create_yearly_data(data):
    grouped = data.groupby('year')
    yearly_sum = grouped.sum()
    yearly_sum['count'] = grouped.size()
    return yearly_sum

def create_counts_data(data,column):
    return data.groupby(column).size()

def create_binned_data(data,column,num_bins=100):
    column_data = data[column]
    valid_data = column_data[np.abs(column_data-column_data.mean())<=(2*column_data.std())]
    valid_data['categories'] = pd.cut(valid_data,bins=num_bins,include_lowest=True)
    return pd.value_counts(valid_data['categories'])



data = pd.read_csv('movies.tsv',sep='\t')

yearly_data = create_yearly_data(data)
yearly_data.to_csv('yearly_data.tsv',sep='\t')

rating_data = create_counts_data(data,'rating')
rating_data.to_csv('rating_data.tsv',sep='\t')

recent_data = filter_data_range(data,2008,2013)
length_data = create_binned_data(recent_data,'length')
length_data.to_csv('length_data.tsv',sep='\t')

budget_data = create_binned_data(recent_data,'budget')
budget_data.to_csv('budget_data.tsv',sep='\t')

votes_data = create_binned_data(recent_data,'votes')
votes_data.to_csv('votes_data.tsv',sep='\t')
